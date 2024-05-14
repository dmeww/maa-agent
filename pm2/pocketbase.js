module.exports = {
    apps : [{
        script: 'pocketbase serve --http 0.0.0.0:8090 --dir /root/pocket/pb_data --migrationsDir /root/pocket/pb_migrations',
        name: 'pocketbase'
    }]
};