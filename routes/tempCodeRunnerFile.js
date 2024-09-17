router.post('/register', async (req, res) => {
    try {
        const admin = new Admin({
            adminId: 'admin123',
            email: 'admin@gmail.com',
            name: 'adminA'
        })
        await admin.generateAuthToken();
        await admin.save();
        return res.json("admin registered")

    } catch (error) {
        res.status(500).json({ message: error.message });
    }

});
