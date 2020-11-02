/**
 * --------------------------------------------------------------------------
 * CoreUI (v3.?): loading-button.js
 * Licensed under MIT (https://coreui.io/license)
 * --------------------------------------------------------------------------
 */

import {
  getjQuery,
  getElementFromSelector,
  typeCheckConfig
} from './util/index'
import Data from './dom/data'
import EventHandler from './dom/event-handler'
import Manipulator from './dom/manipulator'
import SelectorEngine from './dom/selector-engine'

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const NAME = 'loadingbutton'
const VERSION = '3.2.2'
const DATA_KEY = 'coreui.loadingbutton'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'
const SELECTOR_COMPONENT = '[data-coreui="loading-button"]'
const SELECTOR_SPINNER = '[data-target="loading-button"]'
const EVENT_START = `start${EVENT_KEY}`
const EVENT_STOP = `stop${EVENT_KEY}`
const CLASSNAME_LOADING_BUTTON = 'c-loading-button'
const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`

const Default = {
  progress: 100, // max progress
  wait: true, // wait on end
  time: 2.5, // animation time
  stripeColor: 'rgba(0, 0, 0, 0.1)', // stripe color
  ///
  //track: false,
  //trackInterval: 1
}

const DefaultType = {
  progress: 'number',
  wait: 'boolean',
  time: 'number',
  stripeColor: 'string'
}

/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

class LoadingButton {

  constructor(element, config) {

    if (Data.getData(element, DATA_KEY)) { // already found
      console.warn('Instance already exist.');
      return;
    }

    this._element = element
    this._config = this._getConfig(config)
    //console.log('config', this._config);

    if (this._element) {
      Data.setData(element, DATA_KEY, this)
    }

    this._elementSpinner = SelectorEngine.findOne(SELECTOR_SPINNER, element);
    if (this._elementSpinner) {
      this._elementSpinner.style.display = 'none';
    }

    this._elementStripe = this._addStripe(element);

  }


  // Getters

  static get VERSION() {
    return VERSION
  }

  static get Default() {
    return Default
  }

  static get DefaultType() {
    return DefaultType
  }


  // Public

  update(config) { // public method
    this._getConfig(config);
  }

  dispose() {
    Data.removeData(this._element, DATA_KEY)
    this._element = null
  }

  //

  start() {
    let rootElement = this._element
    /*
    if (element) {
      rootElement = this._getRootElement(element)
    }
    */
    const customEvent = this._triggerStartEvent(rootElement)
    if (customEvent === null || customEvent.defaultPrevented) {
      return
    }
    setTimeout(()=>{
      this._animateStripe(this._elementStripe, this._elementSpinner);
      setTimeout(()=>{
        if (!this._config.wait)
          this.stop();
      }, this._config.time*1000);
    }, 1);
  }

  stop() {
    const customEvent = this._triggerStopEvent(this._element)
    if (customEvent === null || customEvent.defaultPrevented) {
      return;
    }
    this._stopStripe(this._elementStripe, this._elementSpinner);
  }


  // Private

  /*
  const tracking = ()=>{
    if (!loadingState)
      return;
    if (onChange){
      let realProgress=null;
      realProgress = onChange('loading', loadingTime);
      if (realProgress){

        //recalculate
        let newTime = loadingTime/realProgress;
        newTime = newTime*(progress-realProgress);
        refStripe.current.style.transition = 'left 0s linear';
        refStripe.current.style.left = (-100+realProgress)+'%';

        data.trackTimeout2 = setTimeout(()=>{
          refStripe.current.style.transition = 'left '+newTime+'s linear'
          refStripe.current.style.left = (-100+progress)+'%';

          //on end
          clearTimeout(data.endTimeout);
          data.endTimeout = setTimeout(()=>{
            if (onChange)
              onChange('end');
            if (progress===100 && waitOnEnd===false){
              setLoadingState(false);
            }
          }, newTime*1000);

        }, 0);

      }
    }
    loadingTime+=trackInterval;
    data.trackTimeout = setTimeout(tracking, trackInterval*1000);
  }
  */

  _getConfig(config) {
    config = {
      ...this.constructor.Default,
      ...Manipulator.getDataAttributes(this._element),
      ...config
    }

    typeCheckConfig(
      NAME,
      config,
      this.constructor.DefaultType
    )

    return config
  }

  _getRootElement(element) {
    //getElementFromSelector(element) || - data-target?
    return element.closest(`.${CLASSNAME_LOADING_BUTTON}`)
  }

  _triggerStartEvent(element) {
    return EventHandler.trigger(element, EVENT_START)
  }

  _triggerStopEvent(element) {
    return EventHandler.trigger(element, EVENT_STOP)
  }

  _addStripe(element) {
    const html = '<div class="c-stripe" style="\
    background-color: '+this._config.stripeColor+';\
    " aria-hidden="true"></div>';
    const stripe = Manipulator.createElementFromHTML(html);
    this._resetStripe(stripe);
    element.prepend(stripe);
    return stripe;
  }

  _resetStripe(element) {
    element.style.transition = 'left 0s linear';
    element.style.left = '-100%';
  }

  _stopStripe(element, elementSpinner) {
    this._resetStripe(element);
    if (elementSpinner)
      elementSpinner.style.display = 'none';
  }

  _animateStripe(element, elementSpinner) {
    element.style.transition = 'left '+this._config.time+'s linear';
    element.style.left = (-100+this._config.progress)+'%';
    if (elementSpinner)
      elementSpinner.style.display = 'inline-block';
  }


  // Static

  static loadingButtonInterface(element, config, par) {
    let data = Data.getData(element, DATA_KEY)
    if (!data) {
      data = typeof config === 'object' ? new LoadingButton(element, config) : new LoadingButton(element)
      data.start();
    }

    if (typeof config === 'string') {
      if (typeof data[config] === 'undefined') {
        throw new TypeError(`No method named "${config}"`)
      }

      switch (config){
        case 'update':
        data[config](par)
        break;
        case 'dispose':
        case 'start':
        case 'stop':
        data[config]()
        break;
      }
    }
  }

  static jQueryInterface(config, par) {
    return this.each(function () {
      LoadingButton.loadingButtonInterface(this, config, par);
    })
  }

  static getInstance(element) {
    return Data.getData(element, DATA_KEY)
  }
}


/**
 * ------------------------------------------------------------------------
 * Data Api implementation
 * ------------------------------------------------------------------------
 */

 EventHandler.on(window, EVENT_LOAD_DATA_API, () => {
   // eslint-disable-next-line unicorn/prefer-spread
   Array.from(document.querySelectorAll(SELECTOR_COMPONENT)).forEach(element => {
     console.log('asa', Manipulator.getDataAttributes(element));
     LoadingButton.loadingButtonInterface(element, Manipulator.getDataAttributes(element))
   })
 })


const $ = getjQuery()

/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
 * add .loadingbutton to jQuery only if jQuery is present
 */

/* istanbul ignore if */
if ($) {
  const JQUERY_NO_CONFLICT = $.fn[NAME]
  $.fn[NAME] = LoadingButton.jQueryInterface
  $.fn[NAME].Constructor = LoadingButton
  $.fn[NAME].noConflict = () => {
    $.fn[NAME] = JQUERY_NO_CONFLICT
    return LoadingButton.jQueryInterface
  }
}

export default LoadingButton
