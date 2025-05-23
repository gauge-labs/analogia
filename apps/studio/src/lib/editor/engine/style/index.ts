import {
    type Change,
    type StyleActionTarget,
    type UpdateStyleAction,
} from '@analogia/models/actions';
import type { DomElement } from '@analogia/models/element';
import { StyleChangeType, type StyleChange } from '@analogia/models/style';
import { makeAutoObservable, reaction } from 'mobx';
import type { EditorEngine } from '..';
import type { Font } from '@analogia/models/assets';
import { convertFontString } from '@analogia/utility';

export interface SelectedStyle {
    styles: Record<string, string>;
    parentRect: DOMRect;
    rect: DOMRect;
}

export enum StyleMode {
    Instance = 'instance',
    Root = 'root',
}

export class StyleManager {
    selectedStyle: SelectedStyle | null = null;
    domIdToStyle: Map<string, SelectedStyle> = new Map();
    prevSelected: string = '';
    mode: StyleMode = StyleMode.Root;

    constructor(private editorEngine: EditorEngine) {
        makeAutoObservable(this);
        reaction(
            () => this.editorEngine.elements.selected,
            (selectedElements) => this.onSelectedElementsChanged(selectedElements),
        );
    }

    updateCustom(style: string, value: string, domIds: string[] = []) {
        const styleObj = { [style]: value };
        const action = this.getUpdateStyleAction(styleObj, domIds, StyleChangeType.Custom);
        this.editorEngine.action.run(action);
        this.updateStyleNoAction(styleObj);
    }

    updateFontFamily(style: string, value: Font) {
        const styleObj = { [style]: value.id };
        const action = this.getUpdateStyleAction(styleObj);
        const formattedAction = {
            ...action,
            targets: action.targets.map((val) => ({
                ...val,
                change: {
                    original: Object.fromEntries(
                        Object.entries(val.change.original).map(([key, styleChange]) => [
                            key,
                            {
                                ...styleChange,
                                value: convertFontString(styleChange.value),
                            },
                        ]),
                    ),
                    updated: Object.fromEntries(
                        Object.entries(val.change.updated).map(([key, styleChange]) => [
                            key,
                            {
                                ...styleChange,
                                value: convertFontString(styleChange.value),
                            },
                        ]),
                    ),
                },
            })),
        };
        this.editorEngine.action.run(formattedAction);
        setTimeout(() => {
            this.editorEngine.webviews.reloadWebviews();
        }, 500);
    }

    update(style: string, value: string) {
        const styleObj = { [style]: value };
        const action = this.getUpdateStyleAction(styleObj);
        this.editorEngine.action.run(action);
        this.updateStyleNoAction(styleObj);
    }

    updateMultiple(styles: Record<string, string>) {
        this.updateStyleNoAction(styles);
        const action = this.getUpdateStyleAction(styles);
        this.editorEngine.action.run(action);
    }

    getUpdateStyleAction(
        styles: Record<string, string>,
        domIds: string[] = [],
        type: StyleChangeType = StyleChangeType.Value,
    ): UpdateStyleAction {
        const selected = this.editorEngine.elements.selected;
        const filteredSelected =
            domIds.length > 0 ? selected.filter((el) => domIds.includes(el.domId)) : selected;

        const targets: Array<StyleActionTarget> = filteredSelected.map((selectedEl) => {
            const change: Change<Record<string, StyleChange>> = {
                updated:
                    type === StyleChangeType.Custom
                        ? Object.fromEntries(
                              Object.keys(styles).map((style) => [
                                  style,
                                  { value: styles[style], type: StyleChangeType.Custom },
                              ]),
                          )
                        : Object.fromEntries(
                              Object.keys(styles).map((style) => [
                                  style,
                                  { value: styles[style], type: StyleChangeType.Value },
                              ]),
                          ),
                original: Object.fromEntries(
                    Object.keys(styles).map((style) => [
                        style,
                        {
                            value:
                                selectedEl.styles?.defined[style] ??
                                selectedEl.styles?.computed[style] ??
                                '',
                            type: StyleChangeType.Value,
                        },
                    ]),
                ),
            };
            const target: StyleActionTarget = {
                webviewId: selectedEl.webviewId,
                domId: selectedEl.domId,
                oid: this.mode === StyleMode.Instance ? selectedEl.instanceId : selectedEl.oid,
                change: change,
            };
            return target;
        });

        return {
            type: 'update-style',
            targets: targets,
        };
    }

    updateStyleNoAction(styles: Record<string, string>) {
        for (const [selector, selectedStyle] of this.domIdToStyle.entries()) {
            this.domIdToStyle.set(selector, {
                ...selectedStyle,
                styles: { ...selectedStyle.styles, ...styles },
            });
        }

        if (this.selectedStyle == null) {
            return;
        }
        this.selectedStyle = {
            ...this.selectedStyle,
            styles: { ...this.selectedStyle.styles, ...styles },
        };
    }

    private onSelectedElementsChanged(selectedElements: DomElement[]) {
        const newSelected = selectedElements
            .map((el) => el.domId)
            .sort()
            .join();
        if (newSelected !== this.prevSelected) {
            this.mode = StyleMode.Root;
        }
        this.prevSelected = newSelected;

        if (selectedElements.length === 0) {
            this.domIdToStyle = new Map();
            return;
        }

        const newMap = new Map<string, SelectedStyle>();
        let newSelectedStyle = null;
        for (const selectedEl of selectedElements) {
            const styles = {
                ...selectedEl.styles?.computed,
                ...selectedEl.styles?.defined,
            };
            const selectedStyle: SelectedStyle = {
                styles,
                parentRect: selectedEl?.parent?.rect ?? ({} as DOMRect),
                rect: selectedEl?.rect ?? ({} as DOMRect),
            };
            newMap.set(selectedEl.domId, selectedStyle);
            if (newSelectedStyle == null) {
                newSelectedStyle = selectedStyle;
            }
        }
        this.domIdToStyle = newMap;
        this.selectedStyle = newSelectedStyle;
    }

    dispose() {
        // Clear state
        this.selectedStyle = null;
        this.domIdToStyle = new Map();
        this.prevSelected = '';
        this.mode = StyleMode.Root;

        // Clear references
        this.editorEngine = null as any;
    }
}
