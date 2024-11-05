export default [
    {
        items: [
            { text: 'Linux', link: '/linux/index' },
            {
                text: '常用命令',
                collapsed: false,
                items: [
                    { text: 'Chmod', link: '/linux/chmod' },
                    { text: 'Crontab', link: '/linux/crontab' },
                ]
            },
            // {
            //     text: '常用服务',
            //     collapsed: false,
            //     items: [
            //         { text: 'Httpd', link: '/linux/command' },
            //     ]
            // },
            { text: 'Shell 脚本', link: '/linux/shell' },
        ]
    },
    // {
    //     text: 'Linux', link: '/linux/index',
    //     collapsed: false,
    //     items: [
    //         { text: '常用命令 ', link: '/linux/command' },
    //         { text: '配置网卡', link: '/linux/network' },
    //         { text: '时间同步', link: '/linux/ntp' },
    //         { text: '磁盘管理', link: '/linux/disk' },
    //         { text: 'Shell 脚本', link: '/linux/shell' },
    //     ]
    // },
]