const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const tabs = $$('.tab-item')
const pans = $$('.tab-pane')

tabs.forEach((tab, index) => {
    const pane = pans[index]
    tab.onclick = function () {
        $('.tab-item.active').classList.remove('active')
        $('.tab-pane.active').classList.remove('active')

        this.classList.add('active')
        pane.classList.add('active')
        
    }
})