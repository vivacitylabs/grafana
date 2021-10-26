import React, { ReactNode } from 'react';
import { useTreeState } from '@react-stately/tree';
import { Item } from '@react-stately/collections';
import { useFocus } from '@react-aria/interactions';
import { mergeProps } from '@react-aria/utils';
import { useMenu, useMenuItem, useMenuSection } from '@react-aria/menu';

function MenuItem({ item, state, onAction }) {
  // Get props for the menu item element
  let ref = React.useRef();
  let isDisabled = state.disabledKeys.has(item.key);
  let isFocused = state.selectionManager.focusedKey === item.key;

  let { menuItemProps } = useMenuItem(
    {
      key: item.key,
      isDisabled,
      onAction,
    },
    state,
    ref
  );

  return (
    <li
      {...menuItemProps}
      ref={ref}
      style={{
        background: isFocused ? 'gray' : 'transparent',
        color: isFocused ? 'white' : null,
        padding: '2px 5px',
        outline: 'none',
        cursor: isDisabled ? 'default' : 'pointer',
      }}
    >
      {item.rendered}
    </li>
  );
}

export default MenuItem;
