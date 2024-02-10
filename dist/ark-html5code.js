/**
 * ark-html5-qr
 * https://github.com/immi5556/ark-html-qr
 *
 * @version 1.0.0
 * @date    2024-05-01
 * this is the extended implementation of html5-qrcode, making it convinient (atleast for me)
 * used my own ark_util.js lib
 *
 * @version 1.0.3
 * scan subscription, validation and fix.
 * scanning position fix
 *  
 * @copyright (c) 2015-2025 Immanuel R, https://www.immanuel.co
 *
 */

var ark_qr = (opt) => {
    var opts = Object.assign({
        dom: undefined,
        camera: 'list', //list -> lists the devices, <deviceid>
        log: false,
        onscan: (d) => {

        },
        onerror: e => {

        }
    }, opt);
    if (opts.log) document.body.insertAdjacentHTML('beforeend', templ_qr_log());
    var log_div = document.getElementById("ark-hqlog");
    var log = (msg) => {
        if (!opts.log) return;
        log_div.insertBefore(ark_util.textToDom(`<p> ${msg}</p>`), log_div.firstChild);
    }
    var onEvent = (selector, event_type, parent, handler) => {
        parent.addEventListener(event_type, (evt) => {
            if (evt.target.closest(selector)) {
                handler(evt);
            }
        });
    };
    //on('#test', 'click', document, (event) => console.log('click'));
    const load_css = css => {
        let el = document.createElement('style');
        el.type = 'text/css';
        el.innerText = css;
        document.head.appendChild(el);
        return el;
    };
    load_css(`
    .ark-qr-img-scan{
        -webkit-filter: grayscale(0) blur(0);
	    filter: grayscale(0) blur(0);
	    -webkit-transition: .3s ease-in-out;
	    transition: .3s ease-in-out;
    }
    .ark-qr-img-scan span {
        display:'';
    }
    .ark-qr-img-scan:hover { 
        -webkit-filter: grayscale(100%) blur(3px);
    	filter: grayscale(100%) blur(3px);
        cursor: pointer;
    }
    #ark-hqlog p:nth-child(odd) {
        background-color: #4C8BF5;
  color: #fff;
    }`);
    const showScanner = () => {
        document.querySelector(".scan-container").style.display = '';
    }
    const hideScanner = () => {
        document.querySelector(".scan-container").style.display = 'none';
    }
    //injectCSS('body { background-color: #000 }');
    //document.addEventListener('DOMContentLoaded', e => {
    //ark_util.loadScript('https://unpkg.com/html5-qrcode', 'body');
    var scriptTag = document.createElement("script");
    scriptTag.onload = function () {
        log('loaded the script');
        (opts.dom || document.body).insertAdjacentHTML('beforeend', templ_qr_scan_btn());
        document.querySelectorAll('.ark-qr-img-scan').forEach(t => {
            t.addEventListener("click", e => {
                start();
                showScanner();
            });
        });
        document.body.insertAdjacentHTML('beforeend', templ_qr_scanner());
        init();
        document.querySelectorAll('.scan-container span, .scan-container img').forEach(t => {
            t.addEventListener("click", e => {
                stop();
                hideScanner();
            });
        });
    }
    scriptTag.src = 'https://unpkg.com/html5-qrcode';
    document.body.append(scriptTag);
    log(`width: ${width}, height: ${height}`);
    //});
    var cameraId;
    var width = window.innerWidth * .9;
    var height = window.innerHeight * .8;
    var html5QrCode;
    ///*https://scanapp.org/html5-qrcode-docs/docs/intro*/
    const init = () => {
        Html5Qrcode.getCameras().then(devices => {
            console.log('camera', devices)
            /**
             * devices would be an array of objects of type:
             * { id: "id", label: "label" }
             */
            if (devices && devices.length) {
                cameraId = devices[0].id;
                // .. use this to start scanning.
            }
        }).catch(err => {
            console.log('camera error', err);
            //log.insertBefore(ark_util.textToDom(`<p>camera error: ${JSON.stringify(err)}</p>`), log.firstChild);
        });
        html5QrCode = new Html5Qrcode("reader");
    }
    function isFunction(functionToCheck) {
        return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
    }
    const start = () => {
        html5QrCode.start(
            { facingMode: "environment" },
            {
                fps: 10,    // Optional, frame per seconds for qr code scanning
                qrbox: { width: width, height: height }  // Optional, if you want bounded box UI
            },
            (decodedText, decodedResult) => {
                // do something when code is read
                console.log('decoded ', decodedText, decodedResult)
                log(`decoded success: ${decodedText} ${JSON.stringify(decodedResult)}`);
                if (isFunction(opts.onscan)) opts.onscan({ ...decodedResult, text: decodedText });
            },
            (errorMessage) => {
                // parse error, ignore it.
                //console.log('decoded error', errorMessage);
                if (errorMessage.indexOf('No MultiFormat Readers were able to detect the code') == -1 && errorMessage.indexOf('No barcode or QR code detected') == -1) {
                    console.log(errorMessage.indexOf('No MultiFormat Readers were able to detect the code, No barcode or QR code detected'));
                    log(`decoded error: ${errorMessage}`);
                    if (isFunction(opts.onerror)) opts.onerror(errorMessage);
                } else {
                    //console.log(errorMessage.indexOf('No MultiFormat Readers were able to detect the code'), errorMessage.indexOf('No barcode or QR code detected'));
                }
            })
            .catch((err) => {
                // Start failed, handle it.
                console.log('decoded exception', err)
                //log.append(ark_util.textToDom(`<p>decoded exception: ${JSON.stringify(err)}</p>`));
                log(`decoded exception: ${JSON.stringify(err)}`);
                if (isFunction(opts.onerror)) opts.onerror(errorMessage);
            });
    }
    const stop = () => {
        html5QrCode.stop().then((ignore) => {
            // QR Code scanning is stopped.
            console.log('scanning stopped...')
            log(`scanning stopped`);
        }).catch((err) => {
            // Stop failed, handle it.
            console.log('scanning stopped error...')
            log(`scanning stopped error : ${JSON.stringify(err)}`);
            if (isFunction(opts.onerror)) opts.onerror(err);
        });
    }
    return {

    }
};

const templ_qr_scan_btn = () => `<div class='ark-qr-img-scan' style='display:inline-block;text-align:center;position:relative;'>
                                    <img src='${qr_scan_btn}' width='' /> <br />
                                    <span>Scan !!!!</span>
                                 </div>`;
const templ_qr_scanner = () => `<div class="scan-container" style='width:100%;height:100%;position:absolute;left: 0px; top: 0px; margin:0px;display:none;text-align:center;'>
                                    <div id="reader" ></div>
                                    <img src='${qr_scanning_gif}' style='margin-top:0px;' />
                                    <span class='scan-cancel' style='cursor:pointer;font-weight:bolder;font-size:xxx-large;margin-left:-155px;'>Cancel</span>
                                </div>`;
const templ_qr_log = () => `<div id="ark-hqlog" style='position:fixed; width: 100%; bottom: 10px; left: 0px;max-height: 150px;overflow: auto;'></div>`;

const qr_scanning_gif = `data:image/gif;base64,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`
const qr_scan_btn = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAAIGNIUk0AAHomAACAhAAA+gAAAIDoAAB1MAAA6mAAADqYAAAXcJy6UTwAAAMAUExURQAAACMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICMfICaXsbcAAAD/dFJOUwABAh5rmqSlnHgxOM7+6GQQvrBbTEtYk/TnQfjFFJF2Xo9VY4dIobxpaNKdnsGJXKIEenk1SXIYUns8Cbh9v6D2RIh/VAWtfIQKjKdil+pXxoPC2KNRpnDjgDDZsk0mdCE+ORpgilC94IV+YSos/UdWsxPh+bVsU1p3NI1CCNqVKKoH78ftBoaxO4KZkqhdReINLuZAF2XPLbkfQyIzK4vKccTU025nWQM6ydfMt9YSMpvD7pRzT8C7J8tttmasb5Yp+zcvPSTc1ZBOmD/lutsVSq9qgfe09es2/I4gdd4WHZ8RqUYOyAz68A/k380jrvHy0Rvsqxxf6fMLJd3QGdaMJPYAAAAHdElNRQfoAgUOADvASFQzAAAJC0lEQVRo3tWae1yM2R/Hn6abTUnppsuGcS2pJqN0nZWkn7bLRFtKKF0RxkRLaRvpsliEECptacrmMtalwlJLkvrl0kUk8ouKqLAW+9vvTs1FTc0zzzMPv9fr9/nn+Z4z3znvOec5z/d8z3kGQdAlI0NCFUJYsnLyCjwpDqXeD4Z9pSRDiDFcGUBFggBGqBKhjFQD9VEaGpqfpCEqTQ0tbZ3RSgQgunr6BpK9ZL4GQwKQMTAWi9s4kCcAIcN4LG4TVCYSgKjCpMlyEjVFHiYSuPOqgFHEIEbGUyXK2IQQhAzTsLiZ/m8gZv83EHMtioWFxVfTqTMsEVlNBCFZzeSWKdafFWJjKz/TjmJv6ED7hjLLcTbJaY4ZxZliO/ezQlzmUP81z9XO8Fs3dw9PutdU3fkLPL3lvvP8zBAtHzDzNVyoYeynD/6LAhRMvcB/sRAyXyqIzJKlgUHIMggWQEJCw8IjDJdTV6wkR2ovWGW2ek2Y9gxiEMastUya31RvISRq3fpoDYfvN2yMiV2wKe6HgHhDq+hFceFEIKxvYbN9whZuvOBDEpOS473nqYcss0hO+XHrthDdmWu2x29P/okIZAdt54TYXamGuwUQ8z17LU3T0sa47tvsuv/AtoU/pe86eCiafJgIJBx4k3OWcLjiM1KVt2VmAejEHVHMtlO2WvazAzNnBxHIWMjtux4V9iQvfL46Oz+iIP5Y3LBfCp0PZnopHvf1JQQZAwmHeq9kAQQ5YRJBdUo9eYoz4vSvZxwXImfPaWQZ6xO68YzzoFY0ACJbHBo1Y5VCyYXJFy+t3E92/y1Pdo/GZYoAItXDeIUDBUr9HkbWqVIA9TKr369eS5+ybnb59cVLKlbcqLxCCIIcWgPXb/aLXaFrjXyq1D3ocy7kjL3yvXa1ybjqtf8uP0IMgtScgrW3PoWV2xrWt+ymb3O3Hn5Z6+idu8zK884JWUmqAoi0i5aLY+0IjnC4SpRUY5GYRWV2RZP9DJ08jczqOKvrh7GJQhC2agMI15OzJSXcvGTh1orfCyyckB9LdMvU8zPn3hNAHKRkcHW2SnhPChWSxifpnzFuvOR3f/297DvUsmTLB/6enwGCjIdZ/LGbM8GxMi+iSb7S4vRDjVxQizPTb350dIMA8pgA5KIQcsndByY6Nv1aaD2pSVHZe5QJ5VZLyhN3AWQqAQj5U08WeLhlRiwOUJusHuIdnGsanTG/zgt6n3hSL8RYSoD5AyUbV0Eu7FJHDtH6z9amILpR8YOa1qKb6Zl0X6Mt4Yis75O710bBMOkYVxXCdJLSIIlXYmlXJ6snq+XJXVif2cJN458cHqnkLGuqyrDlrjlet6XL6mXS3ID21F3YE8SltVeJNs/YsdxHgtVqjsjYIObsXAhdX9EG0s2uG+1t3gc7uINd3YLm5mKvk4I4LW6HghasLX9SSzZEsLjX1J2gKIvit+S5VzO326vDVDyf4Ybs0Ss+0WeEvADOQvF+K093dvRe87NUoq7ihWhBPH97PtwDjKaL9Xu5+1gzr0vx0HAkER9EV+/pSL6Z/gqKl4jza03o4ucSrRHdpXbmuCAnEhpdBfbeauHyOFjBwn2vjFUY8w6+rpiWhgUKbE1mj9h9dn5Xz2uBHePzRhcXJPYx9PDjOPJy9HOx45U4D+YKlxJyZPUuXJTXB6A8mtVnLq3vYYj1S9nSvkhgd3BKQ3BBDGYXgt5bTQM2+4qtIEoOJZm5cCxVUDCEeCccjBb/tTcpz6Gt5+2rF5CdjuLJuAD2f/BtpTcNeA5Z1qso70UyfD10uPHv9jVU16IseMIPKrFR4IwDksSLjK1LvdsgQoLvfmVh0+sguxU7pAIceYaNM7NdU4LzOzjAmyLIyj+7AxHM+g7sO3iWUyaoSfh1R6CSb8UW4jmUCtikQuFHr6AcGnrsYxREWglsQ1DHMb+03tPO8AIe6S3kobrmReZYCuwUnfI/EMxin6lti3vQazV3tn2D5mlTB+HCgkFP7VLMDNbdaU1ucMwuUDbVGOgn0Fz3vHc7KSyQ5oMqZki+Tk7NzUI90Alzgxd70DxJW8GhX4hvQgsPIioBbQR5Rh37SyO8oaJ6rqjq7v8jQkAR82l0E/+E88TRqkZf1LUoArb3XxHL6s/HYoWs0vMK4Fk33tC0UBxfX9eJ6V8ucsvC/Mx/eAJ1QTyTAlkoZ8NTwHvA0i67M4eBYNXHYqh72Wc1d+qJv/MtHt0Dp2zQX8dqMEOQw/ugk9q7kyLdVrkl1mtc5MSBdyzor+MYzsSFyiiEbvmUjljqiN1F4nxsot6LhBzZnf/FlUwynH2gPevcFtjIFudykPaKNbAmwC37Ax4Id6UIBWh7fl/snSQ9VlktUrVBJxlf9tW70yqkZrgkslis2P5i8eSU3/Czpcg3qJGVOBmIK+y2Layurj7P1SSBegvcuuoDtpvg68E/i4IXkgaNTPEqBeZZ0W8EQzReyEXwvnpTnK4u7w57IPIFJ/9aa/wQtPcnMaWFInMLqbledQj/cKEdo1+ETNGqjC2dI/FCyLAR5dNpQBat0m3zx5ND9skKXol9EBH2pcYdonXSvN16+aJrucGHoeXyd2fXoKR0+eARlKzfmG3XszkcDp1O54iI/rS2alACm4btTdtAJb7L/rO9fXM9QCmtljZQevDwkaj/GKjAD+GmwwGpqfsD/eFVYP5ADQ8ZUf63qPciFW/pXzhbd5UPmv8Mr4dBonWHuxPwbbb6y2ki3Bc9Aezo9Bm0cdl7vGGl1BDkZFWXaGrkYvLmB1E3bnInJz0EmQH7Por0LopWNsgtD0w6pIc8U4QLA28BaTsMXvybOyPfEejKI3tIHniYs0758GA3OTBKx9jiUCqiA31D/wqWwRDTlcGBYCL/MzjkD2EXJaYJN+obhhOAIIzg+kj/gxIOg8y3wnbM6fBQYp99Cu/jb6BnVh/9mFYY2xOjvWeOQ2mWXQaaj2v3TGIQ7izL1WdCVRLK1pB1D0+mKkYdqxzaISuGeEPoYuuGwmjcuQ9u1VxWOf3lKS4VMHoH8WYkaJcZ9Hwk3owEvT4HCjZfnLLhYSORiItRsxvufnkI6aQl8UY+o/4BvbQm+daunfIAAAAldEVYdGRhdGU6Y3JlYXRlADIwMjQtMDItMDVUMTQ6MDA6NTkrMDA6MDDeHu5CAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDI0LTAyLTA1VDE0OjAwOjU5KzAwOjAwr0NW/gAAACh0RVh0ZGF0ZTp0aW1lc3RhbXAAMjAyNC0wMi0wNVQxNDowMDo1OSswMDowMPhWdyEAAAAASUVORK5CYII=`;