Vue.component('simulator', {
    template:`<div>
                  <button v-on:click="changeMode('input')">入力</button>
                  <button v-on:click="runSA()">実行</button>
                  <button v-on:click="changeMode('output')">出力</button>
                  <br>
                  <div style="float: left">
                      <svg :viewBox='viewBox' :width="(w*300)">
                          <rect x="0" y="0" :width="(w*100)" :height="(h*100)"
                              style="fill: #0000"
                              @mousedown='mouseDown'/>
                          <edge-item
                              v-for='edge in edges'
                              :key='edge.id'
                              :edge='edge'
                              :pos1='pos[edge.i]'
                              :pos2='pos[edge.j]'
                              :value='values[edge.id]'
                              :mode='mode'
                              :selected_id='selected_id'
                              @select='select'>
                          </edge-item>
                          <node-item
                              v-for='node in nodes'
                              :key='node.id'
                              :node='node'
                              :pos='pos[node.id]'
                              :value='values[node.id]'
                              :mode='mode'
                              :selected_id='selected_id'
                              @select='select'>
                          </node-item>
                      </svg>
                  </div>
                  <div style="float: left">
                      <div v-if="mode=='input' && selected_id != null">
                          <h3>入力: 手動</h3>
                          <input v-model="values[selected_id]" type='number' min='-1' max='1' step='0.01'>
                          <br>
                          <input v-model="values[selected_id]" type='range'  min='-1' max='1' step='0.01'>
                      </div>
                      <div v-if="mode=='input'">
                          <h3>入力: 自動</h3>
                          ->
                          Read<input type='text' v-model="json_output" readonly>
                          <br>
                          <-
                          <button v-on:click="setInput()">Write</button>
                          <input type='text' v-model="json_input">
                          <br>
                          クリップボードで実装したい.jp
                          <br>
                          <-
                          <button v-on:click="setRandomInput()">Random</button>
                          <br>
                          <-
                          <button v-on:click="fillInput('')">Clear</button>
                          <button v-on:click="fillInput(0)">0</button>
                          <button v-on:click="fillInput(1)">1</button>
                          <button v-on:click="fillInput(-1)">-1</button>
                      </div>
                  </div>
                  <div style="clear: both"></div>
              </div>`, // TODO
    props: {
        h: { default: 3 },
        w: { default: 3 },
    },
    computed: {
        viewBox: function() { return `0 0 ${this.w*100} ${this.h*100}`; },
        json_output:    function() { return JSON.stringify(this.values); },
    },
    data: function() {
        return {
            nodes: [],
            edges: [],
            values: [], 
            values_input: [], 
            values_output: [], 
            json_input: "",
            pos: [],
            mode: "input",
            selected_id: null,
        }
    },
    created: function() {
        this.values = this.values_input;

        // add nodes
        for(var i=0;i<this.h;i++) {
            for(var j=0;j<this.w;j++) {
                for(var k=0;k<8;k++) {
                    this.nodes.push({
                        id: this.values.length,
                    });
                    this.values_input.push('');
                    this.values_output.push('');

                    // calculate pos
                    this.pos.push({
                        x: j*100 + (k < 4 ? k%4*20 + (k < 2 ? 10 : 30) : 50),       // TODO
                        y: i*100 + (k < 4 ? 50 : k%4*20 + (k < 6 ? 10 : 30)),       // TODO
                    });
                }
            }
        }

        // add edges
        for(var i=0;i<this.h;i++) {
            for(var j=0;j<this.w;j++) {
                for(var k=0;k<8;k++) {
                    var id = i*this.w*8 + j*8 + k;
                    if(k < 4){
                        for(var l=4;l<8;l++){
                            this.edges.push({i: id, j: id-k+l, id: this.values.length,});
                            this.values_input.push('');
                            this.values_output.push('');
                        }
                        if(i < this.h-1){
                            this.edges.push({i: id, j: id+this.w*8, id: this.values.length,});
                            this.values_input.push('');
                            this.values_output.push('');
                        }
                    }else{
                        if(j < this.w-1){
                            this.edges.push({i: id, j: id+8, id: this.values.length,});
                            this.values_input.push('');
                            this.values_output.push('');
                        }
                    }
                }
            }
        }
    },
    methods: {
        select: function(id) {
            this.selected_id = id;
        }, 
        mouseDown: function() {
            this.selected_id = null;
        },
        changeMode: function(mode) {
            this.mode = mode;
            if(mode == "input" ){ this.values = this.values_input; }
            if(mode == "output"){ this.values = this.values_output; }
            this.selected_id = null;
        },
        setInput: function() {
            var array = JSON.parse(this.json_input);
            for(var i=0;i<this.values_input.length;i++){
                Vue.set(this.values_input, i, array[i]);
            }
        },
        setRandomInput: function() {
            for(var i=0;i<this.values_input.length;i++){
                Vue.set(this.values_input, i, Math.round((Math.random()*2-1)*100)/100);
            }
        },
        fillInput: function(v) {
            for(var i=0;i<this.values_input.length;i++){
                Vue.set(this.values_input, i, v);
            }
        },
        runSA: function() {
            this.changeMode('run');

            // create graph
            var graph = new Array(this.nodes.length);
            for(var i=0;i<this.nodes.length;i++){
                graph[i] = [];
            }
            for(const edge of this.edges){
                graph[edge.i].push({to: edge.j, weight: this.values[edge.id]});
                graph[edge.j].push({to: edge.i, weight: this.values[edge.id]});
            }

            // create state
            var state = new Array(this.nodes.length);
            for(var i=0;i<state.length;i++){
                state[i] = Math.random() < 0.5 ? -1 : 1;
            }

            // set output
            for(var i=0;i<this.values.length;i++){
                Vue.set(this.values_output, i, this.values_input[i] === '' ? '' : i < this.nodes.length ? state[i] : 1);
            }

            this.changeMode('output');
        },
    },
});

Vue.component('edge-item', {
    template: `<g
                   @mouseover="mouseOver"
                   @mousedown="mouseDown"
                   @mouseleave="mouseLeave">
                   <line :x1="pos1.x" :y1="pos1.y" :x2="pos2.x" :y2="pos2.y"
                         :stroke="stroke"
                         :stroke-width="stroke_width" />
                   <line :x1="pos1.x" :y1="pos1.y" :x2="pos2.x" :y2="pos2.y"
                         stroke="#0000"
                         stroke-width="3"/>
                   <text v-if="this.mode=='input'"
                         :x="((pos1.x+pos2.x)/2)"
                         :y="((pos1.y+pos2.y)/2)"
                         :font-size='font_size'
                         text-anchor="middle"
                         dominant-baseline="ventral"
                         >
                         {{value}}
                   </text>
               </g>`,
    props: ['edge', 'value', 'pos1', 'pos2', 'mode', 'selected_id'],
    data: function() {
        return {
            mouse_over: false,
        }
    },
    computed: {
        stroke_width:   function() { return this.active ? 2 : 1; },
        stroke:         function() { return this.isnull ? (this.active ? "#aaa" : "#eee") : this.color; },
        stroke:         function() {
            if(this.mode == "output"){
                return this.value == 1 ? "#aaa" : "#fff";
            }
            if(this.isnull){
                return this.active ? "#aaa" : "#eee";
            }else{
                return this.color;
            }
        },
        active:         function() { return (this.mouse_over || this.selected_id == this.edge.id) && this.mode == "input"},
        isnull:         function() { return this.value === ''}, 
        font_size:      function() { return this.active ? 6 : 3; },
        color:          function() { return `rgb(${255*(this.value/2+0.5)}, 80, ${255*(1-(this.value/2+0.5))})` },
    },
    methods: {
        mouseOver:  function(){ this.mouse_over = true;  },
        mouseLeave: function(){ this.mouse_over = false; },
        mouseDown:  function(){ this.mouse_over = true; this.$emit('select', this.edge.id);},
    },
});

Vue.component('node-item', {
    template: `<g
                   @mouseover="mouseOver"
                   @mousedown="mouseDown"
                   @mouseleave="mouseLeave">
                   <circle :cx="pos.x"
                           :cy="pos.y"
                           :r="r"
                           :stroke="stroke"
                           :fill="fill"
                           :stroke-width="stroke_width"/>
                   <text v-if="this.mode=='input'"
                           :x="pos.x"
                           :y="pos.y"
                           :font-size='font_size'
                           text-anchor="middle"
                           dominant-baseline="ventral"
                           >
                           {{value}}
                   </text>
               </g>`,
    props: ['node', 'value', 'pos', 'mode', 'selected_id'],
    data: function() {
        return {
            mouse_over: false,
        }
    },
    computed: {
        r:              function() { return this.active ? 8 : 6; },
        stroke_width:   function() { return this.active ? 2 : 1; },
        stroke:         function() { return this.isnull ? (this.active ? "#aaa" : "#eee") : this.color; },
        font_size:      function() { return this.active ? 6 : 3; },
        fill:           function() { return this.isnull ? "#fff" : this.color; },
        active:         function() { return (this.mouse_over || this.selected_id == this.node.id) && this.mode == "input"},
        isnull:         function() { return this.value === ''},
        color:          function() { return `rgb(${255*(this.value/2+0.5)}, 80, ${255*(1-(this.value/2+0.5))})` },
    },
    methods: {
        mouseOver:  function(){ this.mouse_over = true;},
        mouseLeave: function(){ this.mouse_over = false },
        mouseDown:  function(){ this.mouse_over = true; this.$emit('select', this.node.id);},
    },
});

window.onload = function(){
    new Vue({el: "#vue-wrap"});
};
