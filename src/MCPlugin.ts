import { ViewUpdate, PluginValue, EditorView, ViewPlugin } from '@codemirror/view'

class ExamplePlugin implements PluginValue {
    private dom: HTMLDivElement | null = null
    constructor(_view: EditorView) {}

    update(update: ViewUpdate) {}

    destroy() {
        this.dom?.remove()
    }
}

export const examplePlugin = ViewPlugin.fromClass(ExamplePlugin)
