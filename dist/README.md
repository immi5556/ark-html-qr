# ark-html-qr
This is my convenient library extended from [html5-qrcode](https://github.com/mebjas/html5-qrcode). for easy scanning and with better and easy UI (at least for me)
### Live Demo
[https://ark-html-qr.immanuel.co/](https://ark-html-qr.immanuel.co/)
### Install
    <script src="/dist/ark-html5code.js"></script>
### Getting Started

    ark_qr({
	    dom: <dom where the scan icon should appear>,
	    camera: 'list', //list -> lists the devices, <deviceid>
	    log: false, // log window appears to trace the logs
	    onscan: (d) => {

        },
        onerror: e => {

        }
    })

### Screen shots
![Scanner Image](/img_1.PNG "Scanner Image with in dom")

### Features
- [x] Custom camera Icon
- [x] Mobile first


### TO DOs
- [ ]  extend config
- 
### Developer
Immanuel - [immanuel.co](immanuel.co)