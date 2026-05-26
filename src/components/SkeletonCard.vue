<template>
  <div class="skeleton-card">
    <div class="skeleton-line badge-skeleton"></div>
    <div class="skeleton-line title-skeleton-1"></div>
    <div class="skeleton-line title-skeleton-2"></div>
    <div class="skeleton-line body-skeleton-1"></div>
    <div class="skeleton-line body-skeleton-2"></div>
    <div class="scores-skeleton">
      <div class="skeleton-line score-bar-1"></div>
      <div class="skeleton-line score-bar-2"></div>
      <div class="skeleton-line score-bar-3"></div>
    </div>
  </div>
</template>

<style scoped>
.skeleton-card {
  background-color: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1rem;
}

.skeleton-line {
  background: linear-gradient(
    90deg, 
    var(--color-border) 25%, 
    var(--color-bg-secondary) 50%, 
    var(--color-border) 75%
  );
  background-size: 200% 100%;
  border-radius: 4px;
  animation: shimmer 1.5s infinite linear;
}

.badge-skeleton {
  width: 30%;
  height: 20px;
}

.title-skeleton-1 {
  width: 90%;
  height: 16px;
  margin-top: 12px;
}

.title-skeleton-2 {
  width: 75%;
  height: 16px;
  margin-top: 6px;
}

.body-skeleton-1 {
  width: 60%;
  height: 12px;
  margin-top: 16px;
}

.body-skeleton-2 {
  width: 80%;
  height: 12px;
  margin-top: 6px;
}

.scores-skeleton {
  margin-top: 10px;
}

.score-bar-1 {
  height: 6px;
  width: 100%;
  margin-top: 10px;
}

.score-bar-2 {
  height: 6px;
  width: 80%;
  margin-top: 10px;
}

.score-bar-3 {
  height: 6px;
  width: 65%;
  margin-top: 10px;
}

@keyframes shimmer {
  from {
    background-position: 200% 0;
  }
  to {
    background-position: -200% 0;
  }
}
</style>
