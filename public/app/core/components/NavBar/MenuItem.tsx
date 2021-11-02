import React, { useRef } from 'react';
import { useMenuItem } from '@react-aria/menu';

function MenuItem({ item, state, onAction }) {
  // Get props for the menu item element
  let ref = useRef<HTMLLIElement>(null);
  let isDisabled = state.disabledKeys.has(item.key);
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
