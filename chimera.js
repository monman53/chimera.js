Vue.component('simulator', {
    template:`<div>
                  <svg :viewBox='viewBox' :width="(w*200)">
                      <rect x="0" y="0" :width="(w*100)" :height="(h*100)"
                          style="fill: #0000"
                          @mousedown='mouseDown'/>
                      <edge-item
                          v-for='edge in edges'
                          :key='edge.id'
                          :edge='edge'
                          :pos='pos'
                          :values='values'
                          :selected_id='selected_id'
                          @select='select'>
                      </edge-item>
                      <node-item
                          v-for='node in nodes'
                          :key='node.id'
                          :node='node'
                          :pos='pos'
                          :values='values'
                          :selected_id='selected_id'
                          @select='select'>
                      </node-item>
                  </svg>
                  <div>
                      <button v-on:click="changeMode('input')">入力</button>
                      <button v-on:click="changeMode('run')">実行</button>
                      <button v-on:click="changeMode('output')">出力</button>
                      <br>
                      <input v-model="values[selected_id]" type='number' min='-1' max='1' step='0.01'>
                      <input v-model="values[selected_id]" type='range'  min='-1' max='1' step='0.01'>
                      <br>
                      <input type='text' v-model="json_output" readonly>
                      <input type='text' v-model="json_input">
                      <button v-on:click="setInput()">書き込み</button>
                  </div>
              </div>`, 
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
            changeMode("input");
            var array = JSON.parse(this.json_input);
            this.values_input = array;
        },
        runSA: function() {
        },
    },
});

Vue.component('edge-item', {
    template: `<g>
                   <line :x1="x1" :y1="y1" :x2="x2" :y2="y2"
                         :stroke="stroke"
                         :stroke-width="stroke_width" />
                   <line :x1="x1" :y1="y1" :x2="x2" :y2="y2"
                         stroke="#0000"
                         stroke-width="3"
                         @mouseover="mouseOver"
                         @mousedown="mouseDown"
                         @mouseleave="mouseLeave"/>
                   <text :x="((x1+x2)/2)"
                         :y="((y1+y2)/2)"
                         font-size='3'
                         text-anchor="middle"
                         dominant-baseline="ventral"
                         >
                         {{values[edge.id]}}
                   </text>
               </g>`,
    props: ['edge', 'values', 'pos', 'selected_id'],
    data: function() {
        return {
            mouse_over: false,
        }
    },
    computed: {
        stroke_width:   function() { return this.active ? 1.5 : 1; },
        stroke:         function() { return this.active ? "#aaa" : (this.isnull ? "#eee" : "#aaa"); },
        x1:             function() { return this.pos[this.edge.i].x; }, 
        y1:             function() { return this.pos[this.edge.i].y; },
        x2:             function() { return this.pos[this.edge.j].x; }, 
        y2:             function() { return this.pos[this.edge.j].y; },
        active:         function() { return this.mouse_over || this.selected_id == this.edge.id},
        isnull:         function() { return this.values[this.edge.id] == ''}
    },
    methods: {
        mouseOver:  function(){ this.mouse_over = true;  },
        mouseLeave: function(){ this.mouse_over = false; },
        mouseDown:  function(){ this.mouse_over = true; this.$emit('select', this.edge.id);},
    },
});

Vue.component('node-item', {
    template: `<g>
                   <circle :cx="cx"
                           :cy="cy"
                           :r="r"
                           :stroke="stroke"
                           :fill="fill"
                           :stroke-width="stroke_width"
                           @mouseover="mouseOver"
                           @mousedown="mouseDown"
                           @mouseleave="mouseLeave"/>
                   <text   :x="cx"
                           :y="cy"
                           font-size='3'
                           text-anchor="middle"
                           dominant-baseline="ventral"
                           >
                           {{values[node.id]}}
                   </text>
               </g>`,
    props: ['node', 'values', 'pos', 'selected_id'],
    data: function() {
        return {
            mouse_over: false,
        }
    },
    computed: {
        cx:             function() { return this.pos[this.node.id].x; },
        cy:             function() { return this.pos[this.node.id].y; },
        r:              function() { return this.active ? 8 : 6; },
        stroke_width:   function() { return this.active ? 1.5 : 1; },
        stroke:         function() { return this.active ? "#aaa" : (this.isnull ? "#eee" : "#aaa"); },
        fill:           function() { return this.active ? "#fff" : "#fff"; },
        active:         function() { return this.mouse_over || this.selected_id == this.node.id},
        isnull:         function() { return this.values[this.node.id] == ''}
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
