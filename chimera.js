Vue.component('simulator', {
    template:`<div>
                  <svg :viewBox='viewBox' :width="width">
                      <edge-item
                          v-for='edge in edges'
                          :edge='edge'
                          :nodes='nodes'
                          @select='select'>
                      </edge-item>
                      <node-item
                          v-for='node in nodes'
                          :node='node'
                          @select='select'>
                      </node-item>
                  </svg>
                  <input v-model="input_item.v" type='number' min='-1' max='1' step='0.01'>
                  <input v-model="input_item.v" type='range'  min='-1' max='1' step='0.01'>
              </div>`, 
    props: {
        h: { default: 3 },
        w: { default: 3 },
    },
    data: function() {
        return {
            graph: [],
            nodes: [],
            edges: [],
            input_item: {v: 0},
        }
    },
    computed: {
        viewBox: function() { return `0 0 ${this.w*100} ${this.h*100}`; },
        width:   function() { return `${this.w*200}`; },
    },
    created: function() {
        // create graph
        for(var i=0;i<this.h*this.w*8;i++) {
            this.graph.push([]);
            for(var j=0;j<this.h*this.w*8;j++) {
                this.graph[i].push(0);
            }
        }
        for(var i=0;i<this.h;i++) {
            for(var j=0;j<this.w;j++) {
                for(var k=0;k<8;k++) {
                    // add nodes
                    this.nodes.push({
                        x: j*100 + 50 + (k < 4 ? (k%2+1)*20*(k < 2 ? -1 : 1) : 0),  // TODO
                        y: i*100 + (k < 4 ? 50 : k%4*20 + (k < 6 ? 10 : 30)),       // TODO
                        v: 0,
                    });

                    // add edges
                    var id = i*this.w*8 + j*8 + k;
                    if(k < 4){
                        for(var l=4;l<8;l++){
                            this.edges.push({i: id, j: id-k+l, v: 0});
                        }
                        if(i < this.h-1){
                            this.edges.push({i: id, j: id+this.w*8, v: 0});
                        }
                    }else{
                        if(j < this.w-1){
                            this.edges.push({i: id, j: id+8, v: 0});
                        }
                    }
                }
            }
        }
    },
    methods: {
        select: function(item) {
            this.input_item = item;
        }
    },
});

Vue.component('edge-item', {
    template: `<g>
                   <line :x1="x1" :y1="y1" :x2="x2" :y2="y2"
                         :stroke="stroke"
                         :stroke-width="stroke_width" />
                   <line :x1="x1" :y1="y1" :x2="x2" :y2="y2"
                         stroke="#0000"
                         stroke-width="7"
                         @mouseover="mouseOver"
                         @mousedown="mouseDown"
                         @mouseleave="mouseLeave"/>
               </g>`,
    props: ['edge', 'nodes'],
    data: function() {
        return {
            mouse_over: false,
        }
    },
    computed: {
        stroke_width:   function() { return this.mouse_over ? 2 : 1; },
        stroke:         function() { return this.mouse_over ? "#aaa" : "#ddd"; },
        x1:             function() { return this.nodes[this.edge.i].x; }, 
        y1:             function() { return this.nodes[this.edge.i].y; },
        x2:             function() { return this.nodes[this.edge.j].x; }, 
        y2:             function() { return this.nodes[this.edge.j].y; },
    },
    methods: {
        mouseOver:  function(){ this.mouse_over = true;  },
        mouseLeave: function(){ this.mouse_over = false; },
        mouseDown:  function(){ this.mouse_over = true; this.$emit('select', this.edge);},
    },
});

Vue.component('node-item', {
    template: `<circle :cx="node.x"
                       :cy="node.y"
                       :r="r"
                       :stroke="stroke"
                       :fill="fill"
                       :stroke-width="stroke_width"
                       @mouseover="mouseOver"
                       @mousedown="mouseDown"
                       @mouseleave="mouseLeave"/>`,
    props: ['node'],
    data: function() {
        return {
            mouse_over: false,
        }
    },
    computed: {
        r:              function() { return this.mouse_over ? 8 : 6; },
        stroke_width:   function() { return this.mouse_over ? 2 : 1; },
        stroke:         function() { return this.mouse_over ? "#aaa" : "#ddd"; },
        fill:           function() { return this.mouse_over ? "#fff" : "#fff"; },
    },
    methods: {
        mouseOver:  function(){ this.mouse_over = true;},
        mouseLeave: function(){ this.mouse_over = false },
        mouseDown:  function(){ this.mouse_over = true; this.$emit('select', this.node);},
    },
});

window.onload = function(){
    new Vue({el: "#vue-wrap"});
};
