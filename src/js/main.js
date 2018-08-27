import './vendor';
import Glitch from './components/glitch';

let image = new Image();

image.onload = (event) => {
    let canvas = document.getElementById('canvas');
    canvas.width = event.path[0].width;
    canvas.height = event.path[0].height;
    let context = canvas.getContext('2d');
    
    console.log(event);

	context.drawImage(image, 0, 0, event.path[0].width, event.path[0].height);
}

image.src = '../psy.png';
