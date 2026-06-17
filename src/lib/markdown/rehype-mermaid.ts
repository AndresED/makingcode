import type { Element, Root } from 'hast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

function isMermaidCode(code: Element): boolean {
  const className = code.properties?.className;
  if (!className) return false;

  const classes = Array.isArray(className) ? className : [className];
  return classes.some((value) => {
    const token = String(value);
    return token === 'language-mermaid' || token === 'mermaid';
  });
}

function textContent(node: Element): string {
  let text = '';
  for (const child of node.children ?? []) {
    if (child.type === 'text') text += child.value;
    if (child.type === 'element') text += textContent(child);
  }
  return text;
}

export const rehypeMermaid: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      if (index == null || !parent || node.tagName !== 'pre') return;

      const code = node.children[0];
      if (!code || code.type !== 'element' || code.tagName !== 'code') return;
      if (!isMermaidCode(code)) return;

      const source = textContent(code).trim();
      if (!source) return;

      const diagram: Element = {
        type: 'element',
        tagName: 'div',
        properties: { className: ['mermaid-diagram'] },
        children: [{ type: 'text', value: source }],
      };

      parent.children[index] = diagram;
    });
  };
};
