import './sass/main.scss';
import * as PIXI from 'pixi.js'
import { TimelineLite } from 'gsap';

// Initial HMR Setup
if (module.hot) {
    module.hot.accept()

    module.hot.dispose(() => {
        slider.app.destroy( true, true )
    })
}

class Slider {

    constructor( canvas ) {

        this.canvas = canvas;

        this.setOptions();
        this.createApp();
        this.loadImages();

    }

    setOptions() {

        PIXI.utils.skipHello(); // turn off console branding
        PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.LINEAR;
        PIXI.settings.PRECISION_FRAGMENT = PIXI.PRECISION.HIGH;

        this.canvasWidth = this.canvas.clientWidth;
        this.canvasHeight = this.canvas.clientHeight;
        this.dpr = window.devicePixelRatio && window.devicePixelRatio >= 2 ? 2 : 1;

        this.imageList = [
            'j110.jpg',
            'j104.jpg'
        ];

    }

    createApp() {

        this.app = new PIXI.Application( this.canvasWidth, this.canvasHeight, {
            view: this.canvas,
            width: this.canvasWidth,
            height: this.canvasHeight,
            transparent: true,
            resolution: this.dpr,
            autoResize: true
        });

    }

    loadImages() {

        this.imageList.forEach( file => {
            PIXI.loader.add( file, '/images/' + file );
        });

        PIXI.loader.load( ( l, images ) => { 

            this.images = images;
            this.createSlider();

        });

    }

    createSlider() {

        this.slider = new PIXI.Container();
        this.slider.width = this.app.screen.width;
        this.slider.height = this.app.screen.height;
        this.app.stage.addChild( this.slider );

        this.slider.interactive = true;
        this.slider.on( 'pointerdown', () => {
            this.nextSlide();
        });

        this.addSlides();
        this.createDisplacementFilter();

    }

    addSlides() {

        this.slides = {
            prev: null,
            current: null,
            next: null,
            index: 0,
            count: 0
        };

        let i = 0;

        Object.keys( this.images ).forEach( image => {

            let slide = new PIXI.Sprite( this.images[ image ].texture );
            slide.width = this.app.screen.width;
            slide.height = this.app.screen.height;
            slide.y = i === 0 ? 0 : -this.app.screen.height;

            this.slides[ i ] = slide;
            this.slider.addChild( slide );

            i++;
            this.slides.count++;
            
        });

        this.slides.current = this.slides[0];
        this.slides.next = this.slides.prev = this.slides[1];

    }

    nextSlide() {

        let tl = new TimelineLite();

        tl.to( this.slides.current, 2, {
            y: this.app.screen.height,
            ease: 'Expo.easeInOut'
        }, 0 )

        .to( this.slides.next, 2, {
            y: 0,
            ease: 'Expo.easeInOut'
        }, 0 )

        .to( this.dispFilter.scale, 1, {
            x: 20,
            y: 20,
            ease: 'Expo.easeInOut'
        }, 0 )

        .to( this.dispFilter.scale, 1, {
            x: 0,
            y: 0,
            ease: 'Expo.easeInOut'
        }, 1 )
        
        this.slides.index++;
        this.slides.current = this.slides[ this.slides.index ];

        this.slides.index = this.slides.index + 1 >= this.slides.count ? 0 : this.slides.index++;
        this.slides.next = this.slides[ this.slides.index ];

    }

    createDisplacementFilter() {

        this.dispSprite = PIXI.Sprite.fromImage('/images/disp2.jpg');
        this.dispSprite.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;
        this.dispSprite.scale.y = 1.5;
        this.dispSprite.scale.x = 1.5;
        this.app.stage.addChild( this.dispSprite );

        this.dispFilter = new PIXI.filters.DisplacementFilter( this.dispSprite, 0 );

        this.slider.filters = [ this.dispFilter ];

    }

}

let slider = new Slider( document.getElementById('slider') )

