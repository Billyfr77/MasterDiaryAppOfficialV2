const bcrypt = require('bcryptjs');
const { User } = require('./src/models');

async function resetPassword() {
    try {
        const email = 'admin@masterdiary.com';
        const newPassword = 'Admin123!';
        
        console.log(`🔍 Looking for user: ${email}`);
        const user = await User.findOne({ where: { email } });

        if (!user) {
            console.log("❌ User not found. Creating new admin user...");
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await User.create({
                username: 'Admin',
                email: email,
                password: hashedPassword,
                role: 'admin'
            });
            console.log("✅ New Admin User Created.");
        } else {
            console.log("✅ User found. Updating password...");
            // DO NOT HASH MANUALLY! The User model hooks will hash it.
            user.password = newPassword; 
            await user.save();
            console.log("✅ Password updated successfully.");
        }
    } catch (error) {
        console.error("❌ Error resetting password:", error);
    }
}

resetPassword();
