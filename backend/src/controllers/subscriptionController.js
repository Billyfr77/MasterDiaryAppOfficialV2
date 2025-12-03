/*
 * MasterDiaryApp Official - Construction SaaS Platform
 * Copyright (c) 2025 Billy Fraser. All rights reserved.
 *
 * This software and associated documentation contain proprietary
 * and confidential information of Billy Fraser.
 *
 * Unauthorized copying, modification, distribution, or use of this
 * software, in whole or in part, is strictly prohibited without
 * prior written permission from the copyright holder.
 *
 * For licensing inquiries: billyfr77@example.com
 *
 * Patent Pending: Drag-and-drop construction quote builder system
 * Trade Secret: Real-time calculation algorithms and optimization techniques
 */const { Subscription } = require('../models')

exports.getUserSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      where: { userId: req.user.id }
    })
    if (!subscription) {
      // Create default free subscription if none exists
      const newSub = await Subscription.create({
        userId: req.user.id,
        plan: 'free'
      })
      return res.json(newSub)
    }
    res.json(subscription)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.updateSubscription = async (req, res) => {
  try {
    const { plan } = req.body
    const validPlans = ['free', 'starter', 'pro', 'enterprise']
    if (!validPlans.includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan' })
    }

    const subscription = await Subscription.findOne({
      where: { userId: req.user.id }
    })

    if (subscription) {
      await subscription.update({ plan })
      res.json(subscription)
    } else {
      const newSub = await Subscription.create({
        userId: req.user.id,
        plan
      })
      res.json(newSub)
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.cancelSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      where: { userId: req.user.id }
    })
    if (subscription) {
      await subscription.update({ status: 'cancelled' })
      res.json({ message: 'Subscription cancelled' })
    } else {
      res.status(404).json({ error: 'Subscription not found' })
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}