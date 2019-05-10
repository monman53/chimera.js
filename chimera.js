Vue.component('simulator', {
    template:`<div>
                  <div style="float: left">
                      <svg :viewBox='viewBox' :width="(w*300)">
                          <edge-item
                              v-for='edge in edges'
                              :key='edge.id'
                              :item='edge'
                              :pos1='nodes[edge.i]'
                              :pos2='nodes[edge.j]'
                              :value='values[edge.id]'
                              :mode='mode'
                              @select='select'>
                          </edge-item>
                          <node-item
                              v-for='node in nodes'
                              :key='node.id'
                              :item='node'
                              :pos='nodes[node.id]'
                              :value='values[node.id]'
                              :mode='mode'
                              @select='select'>
                          </node-item>
                      </svg>
                  </div>
                  <div style="float: left">
                      <h3>モード</h3>
                      <button v-on:click="changeMode('input')">入力</button>
                      <button v-on:click="runSA()">実行</button>
                      <button v-on:click="changeMode('output')">結果</button>
                      <br>
                      <div v-if="mode=='input'">
                          <h3>マウスで入力</h3>
                          <button v-on:click="setPallete(-1)">-1</button>
                          <button v-on:click="setPallete(-0.1)">-0.1</button>
                          <button v-on:click="setPallete(0)">0</button>
                          <button v-on:click="setPallete(0.1)">0.1</button>
                          <button v-on:click="setPallete(1)">1</button>
                          <br>
                          <input v-model="palette" type='number' min='-1' max='1' step='0.01'>
                          <input v-model="palette" type='range'  min='-1' max='1' step='0.01'>
                          <br>
                          <button v-on:click="setPallete('')">消しゴム</button>

                          <h3>いっきに入力</h3>
                          <- <button v-on:click="setRandomInput()">Random</button>
                          <input v-model="random_range" type='range'  min='0' max='1' step='0.01' value='0.5'> {{random_range}}
                          <br>
                          <- <button v-on:click="fillInput('')">Clear</button>
                          <button v-on:click="fillInput(0)">0</button>
                          <button v-on:click="fillInput(1)">1</button>
                          <button v-on:click="fillInput(-1)">-1</button>

                          <h3>入力の保存(コピー&ペースト)</h3>
                          -> Read<input type='text' v-model="json_output" readonly>
                          <br>
                          <- <button v-on:click="setInput()">Write</button>
                          <input type='text' v-model="json_input">
                          <br>
                          クリップボードで実装したい.jp
                          <br>
                      </div>
                      <div v-if="mode=='run'">
                          <h3>計算中</h3>
                      </div>
                      <div v-if="mode=='output'">
                          <h3>結果</h3>
                          <table border='1'>
                              <thead>
                                  <tr>
                                      <th></th>
                                      <th></th>
                                      <th align='center'>Energy</th>
                                      <th align='center'>Occurrence</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  <tr v-for='(result, i) in results'>
                                      <td align='center'>{{i+1}}番目の答え</td> 
                                      <td align='center'><button v-on:click='setOutput(i)'>表示</button></td>
                                      <td align='right'>{{result.energy}}</td> 
                                      <td align='right'>{{result.occurrence}}/100</td> 
                                  </tr>
                              </tbody>
                          </table>
                          <dl>
                              <dt><b>Energy<b></dt>
                              <dd>エネルギー．値が小さいほど，その答えは良い</dd>
                              <dt><b>Occurrence<b></dt>
                              <dd>100回実行して，そのうち何回その答えが得られたか</dd>
                          </dl>
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
            results: [],
            json_input: "",
            mode: "input",
            palette: 0,
            random_range: 1,
        }
    },
    created: function() {
        this.values = this.values_input;
        var id = 0;

        // create nodes
        for(var i=0;i<this.h;i++) {
            for(var j=0;j<this.w;j++) {
                for(var k=0;k<8;k++) {
                    this.nodes.push({ 
                        id: id,
                        x: j*100 + (k < 4 ? k%4*20 + (k < 2 ? 10 : 30) : 50),       // TODO
                        y: i*100 + (k < 4 ? 50 : k%4*20 + (k < 6 ? 10 : 30)),       // TODO
                    });
                    id += 1;
                }
            }
        }

        // create edges
        for(var i=0;i<this.h;i++) {
            for(var j=0;j<this.w;j++) {
                for(var k=0;k<8;k++) {
                    var node_id = i*this.w*8 + j*8 + k;
                    if(k < 4){
                        for(var l=4;l<8;l++){
                            this.edges.push({i: node_id, j: node_id-k+l, id: id});
                            id += 1;
                        }
                        if(i < this.h-1){
                            this.edges.push({i: node_id, j: node_id+this.w*8, id: id});
                            id += 1;
                        }
                    }else{
                        if(j < this.w-1){
                            this.edges.push({i: node_id, j: node_id+8, id: id});
                            id += 1;
                        }
                    }
                }
            }
        }

        // create values
        for(var i=0;i<this.nodes.length+this.edges.length;i++){
            this.values_input.push('');
            this.values_output.push('');
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
        setOutput: function(index) {
            for(var i=0;i<this.values.length;i++){
                if(i < this.nodes.length){
                    // nodes
                    Vue.set(this.values_output, i, this.values_input[i] === '' ? '' : this.results[index].state[i]);
                }else{
                    // edges
                    Vue.set(this.values_output, i, this.values_input[i] === '' ? '' : 1);
                }
            }
        },
        energy: function(state) {
            res = 0;
            // nodes
            for(var i=0;i<this.nodes.length;i++){
                if(this.values_input[i] === '') continue;
                res += this.values_input[i]*state[i];
            }
            // edges
            for(var i=0;i<this.edges.length;i++){
                const edge = this.edges[i];
                if(this.values_input[edge.id] === '') continue;
                if(this.values_input[edge.i] === '') continue;
                if(this.values_input[edge.j] === '') continue;
                res += this.values_input[edge.id]*state[edge.i]*state[edge.j];
            }
            return res;
        }, 
        runSA: function() {
            this.changeMode('run'); // TODO 

            // create graph for future fast energy evaluation
            var graph = new Array(this.nodes.length);
            for(var i=0;i<this.nodes.length;i++){
                graph[i] = [];
            }
            for(const edge of this.edges){
                graph[edge.i].push({to: edge.j, weight: this.values_input[edge.id]});
                graph[edge.j].push({to: edge.i, weight: this.values_input[edge.id]});
            }


            //----------------
            // simulated annealing(best state is not used)
            //----------------
            var trial = 100;

            var ans = {};

            for(var i=0;i<trial;i++){
                var iteration = 100000;
                // create state
                var state = new Array(this.nodes.length);
                for(var j=0;j<state.length;j++){
                    state[j] = Math.random() < 0.5 ? -1 : 1;
                }

                // SA
                var alpha       = 0.01;
                var energy_prev = this.energy(state);
                for(var j=0;j<iteration;j++){
                    var id = Math.floor(Math.random() * Math.floor(state.length));

                    var diff = 0;
                    state[id] = state[id] < 0 ? 1 : -1;
                    if(this.values_input[id] !== ''){
                        for(var next of graph[id]){
                            if(this.values_input[next.to] === '') continue;
                            diff += 2*next.weight*state[id]*state[next.to];
                        }
                        diff += 2*this.values_input[id]*state[id];
                    }
                    var energy_next = energy_prev + diff;

                    var p = Math.exp((energy_prev-energy_next)/Math.pow(alpha, j/iteration));
                    if(energy_next < energy_prev || Math.random() < p){
                        energy_prev = energy_next;
                    }else{
                        state[id] = state[id] < 0 ? 1 : -1;
                    }
                }

                // add result
                for(var j=0;j<state.length;j++){
                    if(this.values_input[j] === ''){
                        state[j] = '';
                    }
                }
                var state_string = JSON.stringify(state); // TODO
                if(!(state_string in ans)){
                    ans[state_string] = {occurrence: 1, energy: energy_prev};
                }else{
                    ans[state_string].occurrence++;
                }
            }

            var ans_array = [];
            for(var k in ans){
                ans_array.push({state: JSON.parse(k), energy: ans[k].energy, occurrence: ans[k].occurrence});
            }

            ans_array.sort(function(a, b) {
                if(a.energy == b.energy){
                    return b.occurrence - a.occurrence;
                }else{
                    return a.energy - b.energy;
                }
            });

            //----------------
            // output
            //----------------
            
            this.results = [];
            for(var i=0;i<ans_array.length;i++){
                ans_array[i].energy = Math.round(ans_array[i].energy*100)/100;
                this.results.push(ans_array[i]);
            }

            this.setOutput(0);

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
                         style='pointer-events: none;'
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
                           fill="white"
                           dominant-baseline="ventral"
                           style='pointer-events: none;'
                           >
                           {{value}}
                   </text>
               </g>`,
    props: ['pos'],
    computed: {
        r:    function() { return this.active ? 8 : 7; },
        fill: function() { return this.isnull ? "#fff" : this.color; },
    },
});

window.onload = function(){
    new Vue({el: "#vue-wrap"});
};
