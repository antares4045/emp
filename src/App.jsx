import React from 'react'
import '@/style.css'
import '@/style.scss'


import config from '@config/build_configs'


async function pp(){
    return await new Promise(r => r('async works'))
}

pp().then(console.log)

//export default  `<div class="kek">kek ${config.title}</div>`


export default () => {
    return <div className="kek">просто какой-то текст { config.title }</div>
}