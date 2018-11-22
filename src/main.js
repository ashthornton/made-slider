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

        this.dom = {
            titleNext: document.querySelector('.slide-title .next'),
            titleCurrent: document.querySelector('.slide-title .current'),
            descriptionNext: document.querySelector('.description .next'),
            descriptionCurrent: document.querySelector('.description .current'),
            countNext: document.querySelector('.slide-count .next'),
            countCurrent: document.querySelector('.slide-count .current')
        }

        this.slideData = {
            0: {
                image: 'j110.jpg',
                title: 'J110',
                description: `With the comfort of a lounge chair and the functionality of a dining chair, HAY’s reproduction of Poul M. Voulter’s J110 offers equal measures of strong aesthetics and practicality. Long rods at the back and curved armrests create an inviting expression. Made in lacquered solid beech and available in a variety of colours.`
            },
            1: {
                image: 'j104.jpg',
                title: 'J104',
                description: `Jørgen Bækmark’s J104 chair was designed as a cross between a dining chair and an easy chair, HAY’s reproduction of this classic is crafted in solid beech with a variety of soaped or lacquered finishes.`
            }
        }

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

        Object.keys( this.slideData ).forEach( key => {
            PIXI.loader.add( key, '/images/' + this.slideData[key].image );
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

        this.addSlides();
        this.createDisplacementFilter();
        this.buttonEvents();

    }

    addSlides() {

        this.slides = {
            activeIndex: 0,
            count: 0
        }

        let i = 0;

        Object.keys( this.images ).forEach( key => {

            let slide = new PIXI.Sprite( this.images[key].texture );
            slide.width = this.app.screen.width;
            slide.height = this.app.screen.height;
            slide.y = i === 0 ? 0 : -this.app.screen.height;

            this.slides[ i ] = slide;
            this.slider.addChild( slide );

            i++;
            this.slides.count++;
            
        });

    }

    nextSlide() {

        if( this.nextBtn.getAttribute( 'disabled' ) ) return false;

        this.prevBtn.removeAttribute( 'disabled' );

        if( this.slides.activeIndex + 2 >= this.slides.count ) {
            this.nextBtn.setAttribute( 'disabled', 'disabled' );
        }

        let nextSlideData = this.slideData[ this.slides.activeIndex + 1];
        this.dom.titleNext.textContent = nextSlideData.title;
        this.dom.descriptionNext.textContent = nextSlideData.description;
        this.dom.countNext.textContent = '0' + ( this.slides.activeIndex + 2 );

        let tl = new TimelineLite({
            onComplete: () => {
                this.slides.activeIndex++;
                this.resetText();
            }
        });

        tl.to( this.slides[ this.slides.activeIndex ], 2, {
            y: this.app.screen.height,
            ease: 'Expo.easeInOut'
        }, 0 )

        .fromTo( this.slides[ this.slides.activeIndex + 1 ], 2, {
            y: -this.app.screen.height
        }, {
            y: 0,
            ease: 'Expo.easeInOut'
        }, 0 )

        .to( this.dispFilter.scale, 1, {
            x: 25,
            y: 25,
            ease: 'Expo.easeInOut'
        }, 0 )

        .to( this.dispFilter.scale, 1, {
            x: 0,
            y: 0,
            ease: 'Expo.easeInOut'
        }, 1 )

        .set( '.slide-count .next', { top: '-100%' }, 0 )

        .fromTo( ['.slide-count .current', '.slide-count .next'], 2, {
            yPercent: 0
        }, {
            yPercent: 100,
            ease: 'Expo.easeInOut'
        }, 0 )

        .set( '.slide-title .next', { top: '-100%' }, 0 )

        .fromTo( ['.slide-title .current', '.slide-title .next'], 2, {
            yPercent: 0
        }, {
            yPercent: 100,
            ease: 'Expo.easeInOut'
        }, 0 )

        .fromTo( '.description .current', 2, {
            y: 0,
            autoAlpha: 1,
        }, {
            y: 40,
            autoAlpha: 0,
            ease: 'Expo.easeInOut'
        }, 0 )

        .fromTo( '.description .next', 2, {
            y: -40,
            autoAlpha: 0,
        }, {
            y: 0,
            autoAlpha: 1,
            ease: 'Expo.easeInOut'
        }, 0 )

    }

    prevSlide() {

        if( this.prevBtn.getAttribute( 'disabled' ) ) return false;

        this.nextBtn.removeAttribute( 'disabled' );

        if( this.slides.activeIndex - 2 <= 0 ) {
            this.prevBtn.setAttribute( 'disabled', 'disabled' );
        }

        let nextSlideData = this.slideData[ this.slides.activeIndex - 1];
        this.dom.titleNext.textContent = nextSlideData.title;
        this.dom.descriptionNext.textContent = nextSlideData.description;
        this.dom.countNext.textContent = '0' + ( this.slides.activeIndex );

        let tl = new TimelineLite({
            onComplete: () => {
                this.slides.activeIndex--;
                this.resetText();
            }
        });

        tl.to( this.slides[ this.slides.activeIndex ], 2, {
            y: -this.app.screen.height,
            ease: 'Expo.easeInOut'
        }, 0 )

        .fromTo( this.slides[ this.slides.activeIndex - 1 ], 2, {
            y: this.app.screen.height
        }, {
            y: 0,
            ease: 'Expo.easeInOut'
        }, 0 )

        .to( this.dispFilter.scale, 1, {
            x: 25,
            y: 25,
            ease: 'Expo.easeInOut'
        }, 0 )

        .to( this.dispFilter.scale, 1, {
            x: 0,
            y: 0,
            ease: 'Expo.easeInOut'
        }, 1 )

        .set( '.slide-count .next', { top: '100%' }, 0 )

        .fromTo( ['.slide-count .current', '.slide-count .next'], 2, {
            yPercent: 0
        }, {
            yPercent: -100,
            ease: 'Expo.easeInOut'
        }, 0 )

        .set( '.slide-title .next', { top: '100%' }, 0 )

        .fromTo( ['.slide-title .current', '.slide-title .next'], 2, {
            yPercent: 0
        }, {
            yPercent: -100,
            ease: 'Expo.easeInOut'
        }, 0 )

        .fromTo( '.description .current', 2, {
            y: 0,
            autoAlpha: 1,
        }, {
            y: -40,
            autoAlpha: 0,
            ease: 'Expo.easeInOut'
        }, 0 )

        .fromTo( '.description .next', 2, {
            y: 40,
            autoAlpha: 0,
        }, {
            y: 0,
            autoAlpha: 1,
            ease: 'Expo.easeInOut'
        }, 0 )
        
    }

    resetText() {

        this.dom.titleCurrent.textContent = this.dom.titleNext.textContent;
        this.dom.titleCurrent.removeAttribute('style');
        this.dom.titleNext.textContent = '';
        this.dom.titleNext.removeAttribute('style');

        this.dom.descriptionCurrent.textContent = this.dom.descriptionNext.textContent;
        this.dom.descriptionCurrent.removeAttribute('style');
        this.dom.descriptionNext.textContent = '';
        this.dom.descriptionNext.removeAttribute('style');

        this.dom.countCurrent.textContent = this.dom.countNext.textContent;
        this.dom.countCurrent.removeAttribute('style');
        this.dom.countNext.textContent = '';
        this.dom.countNext.removeAttribute('style');

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

    buttonEvents() {

        this.prevBtn = document.querySelector('.slide-nav [data-direction="prev"]');
        this.nextBtn = document.querySelector('.slide-nav [data-direction="next"]');
        this.prevBtn.addEventListener( 'click', this.prevSlide.bind( this ) );
        this.nextBtn.addEventListener( 'click', this.nextSlide.bind( this ) );

    }

}

let slider = new Slider( document.getElementById('slider-canvas') )

