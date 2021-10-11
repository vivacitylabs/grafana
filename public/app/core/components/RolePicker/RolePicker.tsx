import React, { FC, FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { ClickOutsideWrapper } from '@grafana/ui';
import { SelectableValue } from '@grafana/data';
import { RolePickerMenu } from './RolePickerMenu';
import { RolePickerInput } from './RolePickerInput';

// const stopPropagation = (event: React.MouseEvent<HTMLDivElement>) => event.stopPropagation();

export interface Props {
  /** Primary role selected */
  builtinRole: string;
  // roles: string[];
  getRoles: () => Promise<string[]>;
  getRoleOptions: () => Promise<Array<SelectableValue<string>>>;
  onChange: (newRole: string) => void;
  onBuiltinRoleChange: (newRole: string) => void;
}

export const RolePicker: FC<Props> = ({ builtinRole, getRoles, getRoleOptions, onChange, onBuiltinRoleChange }) => {
  const [isOpen, setOpen] = useState(false);
  const [roleOptions, setRoleOptions] = useState([] as Array<SelectableValue<string>>);
  const [filteredOptions, setFilteredOptions] = useState([] as Array<SelectableValue<string>>);
  const [appliedRoles, setAppliedRoles] = useState({} as { [key: string]: boolean });

  const inputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    async function fetchOptions() {
      let options = await getRoleOptions();
      options = options.filter((option) => {
        return (
          !option.label?.startsWith('grafana:') &&
          !option.label?.startsWith('fixed:') &&
          !option.label?.startsWith('managed:')
        );
      });
      setRoleOptions(options);
      setFilteredOptions(options);

      const roles = await getRoles();
      const rolesMap = {} as any;
      for (const role of roles) {
        rolesMap[role] = true;
      }
      setAppliedRoles(rolesMap);
    }

    fetchOptions();
  }, []);

  // const onApply = useCallback(
  //   (role: string) => {
  //     setOpen(false);
  //     onChange(role);
  //   },
  //   [onChange]
  // );

  const onOpen = useCallback(
    (event: FormEvent<HTMLElement>) => {
      event.preventDefault();
      setOpen(true);
    },
    [setOpen]
  );

  const onInputChange = (query?: string) => {
    if (query) {
      setFilteredOptions(
        roleOptions.filter((option) => {
          return option.label?.toLowerCase().includes(query.toLowerCase());
        })
      );
    } else {
      setFilteredOptions(roleOptions);
    }
  };

  const onBuiltinRoleChangeInternal = (newRole: string) => {
    console.log(newRole);
    onBuiltinRoleChange(newRole);
  };

  const onCustomRoleChangeInternal = (newRoles: string[]) => {
    console.log(newRoles);
  };

  return (
    <div data-testid="role-picker" style={{ position: 'relative' }}>
      <ClickOutsideWrapper onClick={() => setOpen(false)}>
        <RolePickerInput
          role={builtinRole}
          onChange={onInputChange}
          onOpen={onOpen}
          isFocused={isOpen}
          ref={inputRef}
        />
        {isOpen && (
          <RolePickerMenu
            onBuiltinRoleChange={onBuiltinRoleChangeInternal}
            onCustomRolesChange={onCustomRoleChangeInternal}
            onClose={() => setOpen(false)}
            options={filteredOptions}
            builtInRole={builtinRole}
            appliedRoles={appliedRoles}
          />
        )}
      </ClickOutsideWrapper>
    </div>
  );
};
