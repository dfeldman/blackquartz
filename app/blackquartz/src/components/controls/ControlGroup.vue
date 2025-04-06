<template>
    <div :class="['control-group', collapsed ? 'collapsed' : '']">
      <h3 @click="$emit('toggle')">
        <span class="toggle-icon"></span>{{ title }}
      </h3>
      <div class="control-content" v-show="!collapsed">
        <slot></slot>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ControlGroup',
    props: {
      title: { type: String, required: true },
      collapsed: { type: Boolean, default: false }
    },
    emits: ['toggle']
  };
  </script>
  