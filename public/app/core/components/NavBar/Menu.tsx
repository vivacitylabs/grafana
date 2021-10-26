import React, { ReactNode } from 'react';
import { useTreeState } from '@react-stately/tree';
import { Item } from '@react-stately/collections';
import { useFocus } from '@react-aria/interactions';
import { mergeProps } from '@react-aria/utils';
import { useMenu, useMenuItem, useMenuSection } from '@react-aria/menu';
import MenuItem from './MenuItem';

function Menu(props) {
  // Create state based on the incoming props
  let state = useTreeState({ ...props, selectionMode: 'none' });

  // Get props for the menu element
  let ref = React.useRef();
  let { menuProps } = useMenu(props, state, ref);

  return (
    <ul
      {...menuProps}
      ref={ref}
      style={{
        padding: 0,
        listStyle: 'none',
      }}
    >
      {[...state.collection].map((item) => (
        <MenuItem key={item.key} item={item} state={state} onAction={props.onAction} />
      ))}
    </ul>
  );
}

export default Menu;
