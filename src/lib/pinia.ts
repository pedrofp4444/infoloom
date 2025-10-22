import { createPinia, setActivePinia } from "pinia";

let pinia: ReturnType<typeof createPinia> | null = null;

export function ensureActivePinia() {
    if (!pinia) {
        pinia = createPinia();
        setActivePinia(pinia);
    }
    return pinia;
}
