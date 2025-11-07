<script setup>
defineProps({
  message: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div
    class="w-full bg-amber-100 border-l-4 border-amber-500 text-amber-800 dark:bg-amber-900 dark:border-amber-200 dark:text-amber-200 px-4 py-3 mb-6 rounded shadow-sm"
    role="alert"
  >
    <div class="flex items-center gap-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5 flex-shrink-0"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M8.257 3.099c.765-1.36 2.72-1.36 3.485 0l6.518 11.59c.75 1.336-.213 3.01-1.742 3.01H3.48c-1.53 0-2.492-1.674-1.742-3.01L8.257 3.1zM11 13a1 1 0 10-2 0 1 1 0 002 0zm-1-8a1 1 0 00-.993.883L9 6v4a1 1 0 001.993.117L11 10V6a1 1 0 00-1-1z"
          clip-rule="evenodd"
        />
      </svg>
      <span class="text-sm sm:text-base font-medium pl-2">
        {{ message }}
      </span>
    </div>
  </div>
</template>
