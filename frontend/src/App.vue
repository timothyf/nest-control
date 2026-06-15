<script setup>
</script>

<template>
  <header class="app-header">
    <span class="logo">🏠 Nest Control</span>
  </header>
  <RouterView />
</template>

<style>
*, *::before, *::after { box-sizing: border-box; }
body {
  margin: 0;
  font-family: Inter, system-ui, sans-serif;
  background: #f0f2f5;
  color: #333;
}
.app-header {
  background: #1a1a2e;
  color: #fff;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
}
.logo { font-size: 1.25rem; font-weight: 700; }
</style>
