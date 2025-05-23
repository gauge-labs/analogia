import { EditorAttributes } from '@analogia/models/constants';
import type { DomElement } from '@analogia/models/element';
import { getOrAssignDomId } from '../../ids';
import { getDomElement, restoreElementStyle } from '../helpers';
import { getDisplayDirection } from './helpers';
import { createStub, getCurrentStubIndex, moveStub, removeStub } from './stub';
import { elementFromDomId, isValidHtmlElement } from '/common/helpers';

export function startDrag(domId: string): number | null {
    const el = elementFromDomId(domId);
    if (!el) {
        console.warn(`Start drag element not found: ${domId}`);
        return null;
    }
    const parent = el.parentElement;
    if (!parent) {
        console.warn('Start drag parent not found');
        return null;
    }
    const htmlChildren = Array.from(parent.children).filter(isValidHtmlElement);
    const originalIndex = htmlChildren.indexOf(el);
    prepareElementForDragging(el);
    createStub(el);
    const pos = getAbsolutePosition(el);
    el.setAttribute(EditorAttributes.DATA_ANALOGIA_DRAG_START_POSITION, JSON.stringify(pos));
    return originalIndex;
}

export function drag(domId: string, dx: number, dy: number, x: number, y: number) {
    const el = elementFromDomId(domId);
    if (!el) {
        console.warn('Dragging element not found');
        return;
    }
    const styles = window.getComputedStyle(el);
    const pos = JSON.parse(
        el.getAttribute(EditorAttributes.DATA_ANALOGIA_DRAG_START_POSITION) || '{}',
    );
    const left = pos.left + dx - window.scrollX;
    const top = pos.top + dy - window.scrollY;

    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
    el.style.width = styles.width + 1;
    el.style.height = styles.height + 1;
    el.style.position = 'fixed';

    moveStub(el, x, y);
}

export function endDrag(domId: string): {
    newIndex: number;
    child: DomElement;
    parent: DomElement;
} | null {
    const el = elementFromDomId(domId);
    if (!el) {
        console.warn('End drag element not found');
        endAllDrag();
        return null;
    }

    const parent = el.parentElement;
    if (!parent) {
        console.warn('End drag parent not found');
        cleanUpElementAfterDragging(el);
        return null;
    }

    const stubIndex = getCurrentStubIndex(parent, el);
    cleanUpElementAfterDragging(el);
    removeStub();

    if (stubIndex === -1) {
        return null;
    }

    const elementIndex = Array.from(parent.children).indexOf(el);
    if (stubIndex === elementIndex) {
        return null;
    }
    return {
        newIndex: stubIndex,
        child: getDomElement(el, false),
        parent: getDomElement(parent, false),
    };
}

function prepareElementForDragging(el: HTMLElement) {
    const saved = el.getAttribute(EditorAttributes.DATA_ANALOGIA_DRAG_SAVED_STYLE);
    if (saved) {
        return;
    }

    const style = {
        position: el.style.position,
        transform: el.style.transform,
        width: el.style.width,
        height: el.style.height,
        left: el.style.left,
        top: el.style.top,
    };

    el.setAttribute(EditorAttributes.DATA_ANALOGIA_DRAG_SAVED_STYLE, JSON.stringify(style));
    el.setAttribute(EditorAttributes.DATA_ANALOGIA_DRAGGING, 'true');

    if (el.getAttribute(EditorAttributes.DATA_ANALOGIA_DRAG_DIRECTION) !== null) {
        const parent = el.parentElement;
        if (parent) {
            const displayDirection = getDisplayDirection(parent);
            el.setAttribute(EditorAttributes.DATA_ANALOGIA_DRAG_DIRECTION, displayDirection);
        }
    }
}

function getDragElement(): HTMLElement | undefined {
    const el = document.querySelector(
        `[${EditorAttributes.DATA_ANALOGIA_DRAGGING}]`,
    ) as HTMLElement | null;
    if (!el) {
        return;
    }
    return el;
}

function cleanUpElementAfterDragging(el: HTMLElement) {
    restoreElementStyle(el);
    removeDragAttributes(el);
    getOrAssignDomId(el);
}

function removeDragAttributes(el: HTMLElement) {
    el.removeAttribute(EditorAttributes.DATA_ANALOGIA_DRAG_SAVED_STYLE);
    el.removeAttribute(EditorAttributes.DATA_ANALOGIA_DRAGGING);
    el.removeAttribute(EditorAttributes.DATA_ANALOGIA_DRAG_DIRECTION);
    el.removeAttribute(EditorAttributes.DATA_ANALOGIA_DRAG_START_POSITION);
}

function getAbsolutePosition(element: HTMLElement) {
    const rect = element.getBoundingClientRect();
    return {
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY,
    };
}

export function endAllDrag() {
    const draggingElements = document.querySelectorAll(
        `[${EditorAttributes.DATA_ANALOGIA_DRAGGING}]`,
    );
    for (const el of draggingElements) {
        cleanUpElementAfterDragging(el as HTMLElement);
    }
    removeStub();
}
