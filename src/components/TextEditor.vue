<!-- Текстовый редактор -->
<template>
    <div class="text-editor">
        <!-- Панель инструментов -->
        <div v-if="editor" class="toolbar">
            <button type="button" @click="editor.chain().focus().toggleBold().run()"
                :disabled="!editor.can().chain().focus().toggleBold().run()"
                :class="{ 'is-active': editor.isActive('bold') }" title="Полужирный">
                B
            </button>
            <button type="button" @click="editor.chain().focus().toggleItalic().run()"
                :disabled="!editor.can().chain().focus().toggleItalic().run()"
                :class="{ 'is-active': editor.isActive('italic') }" title="Курсив">
                I
            </button>

            <span class="separator" />

            <button type="button" @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
                :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }">
                H1
            </button>
            <button type="button" @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
                :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }">
                H2
            </button>

            <span class="separator" />

            <button type="button" @click="editor.chain().focus().toggleBulletList().run()"
                :class="{ 'is-active': editor.isActive('bulletList') }">
                • Список
            </button>
            <button type="button" @click="editor.chain().focus().toggleOrderedList().run()"
                :class="{ 'is-active': editor.isActive('orderedList') }">
                1. Список
            </button>
            <button type="button" @click="editor.chain().focus().toggleBlockquote().run()"
                :class="{ 'is-active': editor.isActive('blockquote') }">
                Цитата
            </button>

            <span class="separator" />

            <button type="button" @click="editor.chain().focus().undo().run()"
                :disabled="!editor.can().chain().focus().undo().run()">
                Отменить
            </button>
            <button type="button" @click="editor.chain().focus().redo().run()"
                :disabled="!editor.can().chain().focus().redo().run()">
                Повторить
            </button>
        </div>

        <!-- Область редактирования -->
        <EditorContent :editor="editor" class="editor-content" />
    </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { watch } from 'vue';

const props = defineProps<{
    modelValue?: string
}>()

const emit = defineEmits<{
    'update:modelValue': [value: string]
}>()

watch(
    () => props.modelValue,
    (value) => {
        if (!editor.value) return;
        const current = editor.value.getHTML();
        if (value !== current) {
            editor.value.commands.setContent(value ?? '', { emitUpdate: false });
        }
    }
);

const editor = useEditor({
    content: props.modelValue ?? '<p>Начните вводить текст…</p>',
    extensions: [StarterKit],
    onUpdate: ({ editor }) => {
        emit('update:modelValue', editor.getHTML())
    },
})

</script>

<style scoped>
.text-editor {
    border: 1px solid #929191;
    border-radius: 8px;
    overflow: hidden;
}

.toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    padding: 8px;
    border-bottom: 1px solid #ddd;
    background: #fafafa;
}

.toolbar button {
    padding: 4px 10px;
    border: 1px solid transparent;
    border-radius: 4px;
    background: transparent;
    cursor: pointer;
    font-size: 14px;
}

.toolbar button:hover {
    background: #eee;
}

.toolbar button.is-active {
    background: #333;
    color: #fff;
}

.toolbar button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.separator {
    width: 1px;
    background: #ccc;
    margin: 0 4px;
}

.editor-content {
    padding: 12px;
    min-height: 200px;
    outline: none;
}

/* Стили содержимого редактора (ProseMirror) */
.editor-content :deep(.ProseMirror) {
    outline: none;
    min-height: 180px;
}

.editor-content :deep(.ProseMirror p) {
    margin: 0 0 8px;
}

.editor-content :deep(.ProseMirror h1) {
    font-size: 1.6em;
    font-weight: bold;
    margin: 12px 0 8px;
}

.editor-content :deep(.ProseMirror h2) {
    font-size: 1.3em;
    font-weight: bold;
    margin: 10px 0 6px;
}

.editor-content :deep(.ProseMirror ul),
.editor-content :deep(.ProseMirror ol) {
    padding-left: 1.5em;
    margin: 8px 0;
}

.editor-content :deep(.ProseMirror blockquote) {
    border-left: 3px solid #ccc;
    padding-left: 12px;
    color: #666;
    margin: 8px 0;
}
</style>