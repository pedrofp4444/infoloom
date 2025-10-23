import { defineStore } from "pinia";
import { ref, watch } from "vue";

export const useFavoritesStore = defineStore("favorites", () => {
    const favorites = ref<Set<string>>(new Set());

    if (typeof window !== "undefined") {
        const stored = localStorage.getItem("favorites");
        if (stored) {
            favorites.value = new Set(JSON.parse(stored));
        }
    }

    watch(
        favorites,
        (val) => {
            localStorage.setItem("favorites", JSON.stringify(Array.from(val)));
        },
        { deep: true },
    );

    const toggleFavorite = (slug: string) => {
        if (favorites.value.has(slug)) {
            favorites.value.delete(slug);
        } else {
            favorites.value.add(slug);
        }
    };

    const isFavorite = (slug: string) => favorites.value.has(slug);

    return { favorites, toggleFavorite, isFavorite };
});
