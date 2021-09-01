var socket;

function init(){
    socket = io();

    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());
    if(params.hasOwnProperty("present")){
        initPresenter();
    }else{
        initController();
    }
}

function initPresenter(){
    console.log("initPresenter");
    
    var container = document.createElement("div");
    container.className = "container";
    document.body.appendChild(container);

    function add(data) {
        var div = document.createElement("div");
        div.className = "slide";
        container.appendChild(div);

        if(data.title){
            var h2 = document.createElement("h2");
            h2.innerHTML = data.title;
            div.appendChild(h2);
        }

        if(data.subtitle){
            var h3 = document.createElement("h3");
            h3.innerHTML = data.subtitle;
            div.appendChild(h3);
        }

        var mediaContainer = document.createElement("div");
        mediaContainer.className = "mediaContainer";
        div.appendChild(mediaContainer);

        var extension = data.url.split(/[#?]/)[0].split('.').pop().trim();
        if(extension == "mp4"){
            var video = document.createElement("video");
            mediaContainer.appendChild(video);

            var source = document.createElement("source");
            source.src = data.url;
            source.type = "video/mp4";
            video.appendChild(source);
        }else{
            var img = document.createElement("img");
            img.src = data.url;
            mediaContainer.appendChild(img);
        }
    }

    fetch('./data.json')
        .then(response => response.json())
        .then(data => {
            data.forEach(d => add(d));
            onPresenterDataLoaded();
        })
        .catch(error => console.log(error));
}

function onPresenterDataLoaded() {
    var active = 0;
    var prevElement;
    function setActive(index) {
        var children = document.querySelector('.container').children;

        if(index < 0)
            index = children.length-1;
        else if(index >= children.length)
            index = 0;

        active = index;
        var element = children.item(index);

        var mediaElement = element.querySelector(".mediaContainer").firstChild;
        if(mediaElement.nodeName == "VIDEO"){
            mediaElement.play();
            mediaElement.loop = true;
        }

        element.classList.add("active");
        if(prevElement) {
            prevElement.classList.remove("active");
            var prevMediaElement = prevElement.querySelector(".mediaContainer").firstChild;
            if(prevMediaElement.nodeName == "VIDEO"){
                prevMediaElement.pause();
                setTimeout(() => prevMediaElement.currentTime = 0, 500);
            }
        }
        prevElement = element;
    }
    setActive(0);

    socket.on('change', function (data) {
        if(data == "prev")
            setActive(active-1);
        if( data == "next")
            setActive(active+1);
    });
}

function initController(){
    console.log("initController");
    function add(value) {
        var element = document.createElement("input");
        element.type = "button";
        element.value = value;
        element.onclick = function() {
            socket.emit("change", value);
        };
        document.body.appendChild(element);
    }
    add("prev");
    add("next");
}

document.addEventListener("DOMContentLoaded", init)