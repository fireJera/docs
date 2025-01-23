module.exports = {
    title: '小石榴的手册',
    description: '小石榴的手册',
    themeConfig: {
        logo: '/assets/img/logo.jpg',
    },
    nav: [
        { text: 'Home', link: '/' },
        { text: 'Guide', link: '/guide/' },
        { text: 'External', link: 'https://google.com' },
    ],
    sidebar: [
        '/',
        '/page-a',
        ['/page-b', 'Explicit link text']
    ],
    lastUpdated: 'Last Updated', // string | boolean
}