  const handleGenesisCommand = async () => {
      if (!genesisInput.trim()) return;
      const p = genesisInput; 
      setGenesisInput(''); 
      setGenesisLog(prev => [...prev, { role: 'user', content: p }]); 
      setIsGenerating(true);

      let realWorldIntel = { nearbyLogistics: [], transitIntelligence: [] };

      try {
          if (window.google && map) {
              setIsScanning(true);
              
              const placesPromise = new Promise((resolve) => {
                  const service = new window.google.maps.places.PlacesService(map);
                  const timer = setTimeout(() => resolve([]), 3000);
                  service.nearbySearch({
                      location: map.getCenter(),
                      radius: '5000',
                      type: ['hardware_store']
                  }, (results, status) => {
                      clearTimeout(timer);
                      if (status === 'OK') resolve(results?.slice(0, 5) || []);
                      else resolve([]);
                  });
              });

              const matrixPromise = new Promise((resolve) => {
                  const matrix = new window.google.maps.DistanceMatrixService();
                  const timer = setTimeout(() => resolve(null), 3000);
                  const hqAsset = assets.find(a => a.properties?.type === 'office' || a.properties?.type === 'OfficeZone');
                  const activeProj = assets.filter(a => a.properties?.type === 'ProjectZone').slice(0, 2);
                  
                  if (!hqAsset || activeProj.length === 0) return resolve(null);
                  
                  matrix.getDistanceMatrix({
                      origins: [getPolygonCenter(hqAsset.coordinates)],
                      destinations: activeProj.map(ap => getPolygonCenter(ap.coordinates)),
                      travelMode: 'DRIVING'
                  }, (res, status) => {
                      clearTimeout(timer);
                      if (status === 'OK') resolve(res);
                      else resolve(null);
                  });
              });

              const [placesData, transitData] = await Promise.all([placesPromise, matrixPromise]);

              if (placesData.length) {
                  const findings = placesData.map(place => ({
                      id: place.place_id,
                      name: place.name,
                      location: place.geometry.location.toJSON(),
                      type: 'logistics',
                      address: place.vicinity
                  }));
                  realWorldIntel.nearbyLogistics = findings;
                  setLogisticsMarkers(findings);
              }

              if (transitData?.rows?.[0]) {
                  realWorldIntel.transitIntelligence = transitData.rows[0].elements.map((el, idx) => ({
                      travelTime: el.duration?.text,
                      distance: el.distance?.text
                  }));
              }
              
              setTimeout(() => setIsScanning(false), 1000);
          }
      } catch (spatialErr) {
          console.warn("Spatial Enrichment failed", spatialErr);
      }

      const situationReport = {
          center: map?.getCenter()?.toJSON(),
          zoom: zoom,
          realWorldIntel,
          activeProjects: assets.filter(a => a.geometryType === 'POLYGON').length,
          fleetCount: equipment.length
      };

      try {
          const res = await api.post('/ai/chat-map', { 
              message: p, 
              context: situationReport 
          });
          
          setGenesisLog(prev => [...prev, { role: 'system', content: res.data.reply }]);
          
          if (res.data.suggestedActions && res.data.suggestedActions.length > 0) {
              for (const action of res.data.suggestedActions) {
                  if (action.type === 'draw_route' && action.origin && action.destination) {
                      const ds = new window.google.maps.DirectionsService();
                      ds.route({
                          origin: action.origin,
                          destination: action.destination,
                          travelMode: 'DRIVING'
                      }, (result, status) => {
                          if (status === 'OK') setAiRoute(result);
                          else setGenesisLog(prev => [...prev, { 
                              role: 'system', 
                              content: `⚠️ [ROUTING ERROR]: ${status}. Directions API access required.` 
                          }]);
                      });
                  }

                  if (action.type === 'propose_ghost_move' && action.location) {
                      const target = assets.find(a => String(a.id) === String(action.targetId)) || 
                                     staff.find(s => String(s.id) === String(action.targetId)) ||
                                     equipment.find(e => String(e.id) === String(action.targetId));
                      if (target) {
                          setGhostMoves(prev => [...prev, {
                              id: `ghost-${target.id}-${Date.now()}`,
                              originalId: target.id,
                              name: target.name,
                              type: target.type || 'fleet',
                              location: action.location,
                              reason: action.reason
                          }]);
                      }
                  }

                  if (action.location && action.type === 'focus_asset') {
                      map?.panTo(action.location);
                      map?.setZoom(18);
                  }

                  if (action.targetId) {
                      const targetAsset = assets.find(a => String(a.id) === String(action.targetId));
                      if (targetAsset) {
                          if (targetAsset.geometryType === 'POLYGON') setSelectedHub(targetAsset);
                          else setSelectedAsset(targetAsset);
                      }
                  }
              }
          }
      } catch (err) { 
          setGenesisLog(prev => [...prev, { role: 'system', content: "Satellite link interrupted." }]);
      } finally { 
          setIsGenerating(false); 
      }
  };