module.exports = {
    apps: [
        {
            name: 'meneja',
            script: 'node_modules/next/dist/bin/next',
            args: 'start',
            instances: 'max', // Use all available cores
            exec_mode: 'cluster', // Enable cluster mode
            autorestart: true,
            watch: false,
            max_memory_restart: '300M', // Restart if memory exceeds 300MB
            env: {
                NODE_ENV: 'production',
            },
        },
    ],
};
