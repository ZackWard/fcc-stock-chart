// Set up websockets
import * as websockets from "./websockets";

import * as mdc from "material-components-web";
var Vue = require('vue');
import { store } from "./store";
import App from "./components/App.vue";


// Ugh, refer to CSS in our Javascript. =P
require('./styles/style.scss');

// Connect our Vuex state to our websockets
websockets.connect(store);

// Instantiate our app and attach it to the DOM.
new Vue({
    el: "#my-app",
    store,
    render: h => h(App)
});

// Initialize our Material Components
mdc.autoInit();