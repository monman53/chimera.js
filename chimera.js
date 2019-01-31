Vue.component('simulator', {
    template:`<div>
                  <button v-on:click="changeMode('input')">入力</button>
                  <button v-on:click="runSA()">実行</button>
                  <button v-on:click="changeMode('output')">出力</button>
                  <br>
                  <div style="float: left">
                      <svg :viewBox='viewBox' :width="(w*300)">
                          <edge-item
                              v-for='edge in edges'
                              :key='edge.id'
                              :item='edge'
                              :pos1='pos[edge.i]'
                              :pos2='pos[edge.j]'
                              :value='values[edge.id]'
                              :mode='mode'
                              @select='select'>
                          </edge-item>
                          <node-item
                              v-for='node in nodes'
                              :key='node.id'
                              :item='node'
                              :pos='pos[node.id]'
                              :value='values[node.id]'
                              :mode='mode'
                              @select='select'>
                          </node-item>
                      </svg>
                  </div>
                  <div style="float: left">
                      <div v-if="mode=='input'">
                          <h3>マウスで</h3>
                          <button v-on:click="setPallete(-1)">-1</button>
                          <button v-on:click="setPallete(0)">0</button>
                          <button v-on:click="setPallete(1)">1</button>
                          <button v-on:click="setPallete('')">消しゴム</button>
                          <br>
                          <input v-model="palette" type='number' min='-1' max='1' step='0.01'>
                          <input v-model="palette" type='range'  min='-1' max='1' step='0.01'>

                          <h3>いっきに</h3>
                          <- <button v-on:click="setRandomInput()">Random</button>
                          <input v-model="random_range" type='range'  min='0' max='1' step='0.01' value='0.5'> {{random_range}}
                          <br>
                          <- <button v-on:click="fillInput('')">Clear</button>
                          <button v-on:click="fillInput(0)">0</button>
                          <button v-on:click="fillInput(1)">1</button>
                          <button v-on:click="fillInput(-1)">-1</button>

                          <h3>保存(コピー&ペースト)</h3>
                          -> Read<input type='text' v-model="json_output" readonly>
                          <br>
                          <- <button v-on:click="setInput()">Write</button>
                          <input type='text' v-model="json_input">
                          <br>
                          クリップボードで実装したい.jp
                          <br>
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
            palette: 0,
            random_range: 0.5,
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
            Vue.set(this.values_input, id, this.palette);
        }, 
        changeMode: function(mode) {
            this.mode = mode;
            if(mode == "input" ){ this.values = this.values_input; }
            if(mode == "output"){ this.values = this.values_output; }
        },
        setPallete: function(v) {
            this.palette = v;
        },
        setInput: function() {
            var array = JSON.parse(this.json_input);
            for(var i=0;i<this.values_input.length;i++){
                Vue.set(this.values_input, i, array[i]);
            }
        },
        setRandomInput: function() {
            for(var i=0;i<this.values_input.length;i++){
                if(Math.random() < this.random_range){
                    Vue.set(this.values_input, i, Math.round((Math.random()*2-1)*100)/100);
                }else{
                    Vue.set(this.values_input, i, '');
                }
            }
        },
        fillInput: function(v) {
            for(var i=0;i<this.values_input.length;i++){
                Vue.set(this.values_input, i, v);
            }
        },
        energy: function(state) {
            res = 0;
            // nodes
            for(var i=0;i<this.nodes.length;i++){
                if(this.values_input[i] == '') continue;
                res += this.values_input[i]*state[i];
            }
            // edges
            for(var i=0;i<this.edges.length;i++){
                const edge = this.edges[i];
                if(this.values_input[edge.id] == '') continue;
                res += this.values_input[edge.id]*state[edge.i]*state[edge.j];
            }
            return res;
        }, 
        runSA: function() {
            this.changeMode('run');

            // create graph for future fast energy evaluation
            var graph = new Array(this.nodes.length);
            for(var i=0;i<this.nodes.length;i++){
                graph[i] = [];
            }
            for(const edge of this.edges){
                graph[edge.i].push({to: edge.j, weight: this.values[edge.id]});
                graph[edge.j].push({to: edge.i, weight: this.values[edge.id]});
            }


            //----------------
            // simulated annealing(do not use best state)    // TODO current: hill climbing
            //----------------

            // create state
            var state = new Array(this.nodes.length);
            for(var i=0;i<state.length;i++){
                state[i] = Math.random() < 0.5 ? -1 : 1;
            }

            var energy_prev = this.energy(state);

            // routine
            for(var i=0;i<1000;i++){
                var id = Math.floor(Math.random() * Math.floor(state.length));
                //state[id] = 2-(state[id]+1)-1; // flip
                state[id] = -state[id]; // flip
                var energy_next = this.energy(state);
                if(energy_next < energy_prev){
                    energy_prev = energy_next;
                }else{
                    state[id] = -state[id]; // flip
                }
            }


            //----------------
            // output
            //----------------

            // set output
            for(var i=0;i<this.values.length;i++){
                if(i < this.nodes.length){
                    // nodes
                    Vue.set(this.values_output, i, this.values_input[i] === '' ? '' : state[i]);
                }else{
                    // edges
                    Vue.set(this.values_output, i, this.values_input[i] === '' ? '' : 1);
                }
            }

            this.changeMode('output');
        },
    },
});

var common = {
    props: ['item', 'value', 'mode'],
    data: function() {
        return {
            mouse_hover: false,
        }
    },
    computed: {
        stroke:       function() { return this.isnull ? (this.active ? "#aaa" : "#eee") : this.color; },
        stroke_width: function() { return this.active ? 2 : 1; },
        active:       function() { return this.mouse_hover && this.mode == "input"},
        isnull:       function() { return this.value === ''}, 
        font_size:    function() { return this.active ? 6 : 3; },
        color:        function() { return `rgb(${255*(this.value/2+0.5)}, 80, ${255*(1-(this.value/2+0.5))})` },
    },
    methods: {
        mouseEnter:   function(e){ this.mouse_hover = true; if(e.buttons == 1){ this.$emit('select', this.item.id); }},
        mouseLeave:   function(e){ this.mouse_hover = false },
        mouseDown:    function(e){ if(e.buttons == 1){ this.$emit('select', this.item.id); } },
    },
};

Vue.component('edge-item', {
    mixins: [common],
    template: `<g
                   @mouseenter="mouseEnter"
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
    props: ['pos1', 'pos2'],
    computed: {
        stroke: function() {
            if(this.mode == "output"){
                return this.value == 1 ? "#aaa" : "#eee";
            }
            if(this.isnull){
                return this.active ? "#aaa" : "#eee";
            }else{
                return this.color;
            }
        },
    },
});

Vue.component('node-item', {
    mixins: [common],
    template: `<g
                   @mouseenter="mouseEnter"
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
    props: ['pos'],
    computed: {
        r:    function() { return this.active ? 8 : 6; },
        fill: function() { return this.isnull ? "#fff" : this.color; },
    },
});

window.onload = function(){
    new Vue({el: "#vue-wrap"});
};
