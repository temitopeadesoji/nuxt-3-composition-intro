<template>
    <div>
        <div class="note-app__container">
            <div class="note-app__container__input-box">
                <input placeholder="Note titles" v-model="noteTitle" />
                <button @click="addNoteTitle">Submit</button>
            </div>
            <div class="note-app__container__note-box">
                <ul v-if="indexDB.notes.length > 0">
                    <li v-for="(note, i) in indexDB.notes" :key="i">{{ note.title }}</li>
                </ul>
                <div v-else>No notes available</div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
let noteTitle = ref(null);
let indexDB = useIndexdb();

onMounted(() => {
    // Handle indexdb setup
    indexDB.setup().then(() => {
        // Pull data from indexdb
        indexDB.read();

    });
});

const addNoteTitle = (e: Event) => {
    indexDB.create(noteTitle.value);
};
</script>


<style>
.note-app__container {
    width: 100%;
    max-width: 500px;
    margin: 50px auto;
}
.note-app__container__input-box {
    width: 100%;
    display: flex;
    gap: 10px;
}
.note-app__container__input-box input {
    width: 80%;
    height: 50px;
    padding: 0 10px;
}
.note-app__container__input-box button {
    width: 20%;
}
</style>
