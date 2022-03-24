import React, { PureComponent, useRef, useState } from 'react';
import { Role, ServiceAccountDTO } from 'app/types';
import { css, cx } from '@emotion/css';
import { dateTimeFormat, GrafanaTheme2, OrgRole, TimeZone } from '@grafana/data';
import { Button, ConfirmButton, ConfirmModal, Input, LegacyInputStatus, useStyles2 } from '@grafana/ui';
import { ServiceAccountRoleRow } from './ServiceAccountRoleRow';

interface Props {
  serviceAccount: ServiceAccountDTO;
  timeZone: TimeZone;

  roleOptions: Role[];
  builtInRoles: Record<string, Role[]>;
  deleteServiceAccount: (serviceAccountId: number) => void;
  updateServiceAccount: (serviceAccount: ServiceAccountDTO) => void;
}

export function ServiceAccountProfile({
  serviceAccount,
  timeZone,
  roleOptions,
  builtInRoles,
  deleteServiceAccount,
  updateServiceAccount,
}: Props) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);

  const deleteServiceAccountRef = useRef<HTMLButtonElement | null>(null);
  const showDeleteServiceAccountModal = (show: boolean) => () => {
    setShowDeleteModal(show);
    if (!show && deleteServiceAccountRef.current) {
      deleteServiceAccountRef.current.focus();
    }
  };

  const disableServiceAccountRef = useRef<HTMLButtonElement | null>(null);
  const showDisableServiceAccountModal = (show: boolean) => () => {
    setShowDisableModal(show);
    if (!show && disableServiceAccountRef.current) {
      disableServiceAccountRef.current.focus();
    }
  };

  const handleServiceAccountDelete = () => {
    deleteServiceAccount(serviceAccount.id);
  };
  const handleServiceAccountDisable = () => {
    updateServiceAccount({ ...serviceAccount, isDisabled: true });
    setShowDisableModal(false);
  };

  const handleServiceAccountEnable = () => {
    updateServiceAccount({ ...serviceAccount, isDisabled: false });
  };

  const handleServiceAccountRoleChange = (role: OrgRole) => {
    updateServiceAccount({ ...serviceAccount, role: role });
  };

  const onServiceAccountNameChange = (newValue: string) => {
    updateServiceAccount({ ...serviceAccount, name: newValue });
  };

  const styles = useStyles2(getStyles);

  return (
    <>
      <h3 className="page-heading">Information</h3>
      <a href="org/serviceaccounts">
        <Button variant="link" icon="backward" />
      </a>
      <div className="gf-form-group">
        <div className="gf-form">
          <table className="filter-table form-inline">
            <tbody>
              <ServiceAccountProfileRow
                label="Display Name"
                value={serviceAccount.name}
                onChange={onServiceAccountNameChange}
              />
              <ServiceAccountProfileRow label="ID" value={serviceAccount.login} />
              <ServiceAccountRoleRow
                label="Roles"
                serviceAccount={serviceAccount}
                onRoleChange={handleServiceAccountRoleChange}
                builtInRoles={builtInRoles}
                roleOptions={roleOptions}
              />
              <ServiceAccountProfileRow label="Teams" value={serviceAccount.teams.join(', ')} />
              <ServiceAccountProfileRow
                label="Creation date"
                value={dateTimeFormat(serviceAccount.createdAt, { timeZone })}
              />
            </tbody>
          </table>
        </div>
        <div className={styles.buttonRow}>
          <>
            <Button
              type={'button'}
              variant="destructive"
              onClick={showDeleteServiceAccountModal(true)}
              ref={deleteServiceAccountRef}
            >
              Delete service account
            </Button>
            <ConfirmModal
              isOpen={showDeleteModal}
              title="Delete service account"
              body="Are you sure you want to delete this service account?"
              confirmText="Delete service account"
              onConfirm={handleServiceAccountDelete}
              onDismiss={showDeleteServiceAccountModal(false)}
            />
          </>
          {serviceAccount.isDisabled ? (
            <Button type={'button'} variant="secondary" onClick={handleServiceAccountEnable}>
              Enable service account
            </Button>
          ) : (
            <>
              <Button
                type={'button'}
                variant="secondary"
                onClick={showDisableServiceAccountModal(true)}
                ref={disableServiceAccountRef}
              >
                Disable service account
              </Button>
              <ConfirmModal
                isOpen={showDisableModal}
                title="Disable service account"
                body="Are you sure you want to disable this service account?"
                confirmText="Disable service account"
                onConfirm={handleServiceAccountDisable}
                onDismiss={showDisableServiceAccountModal(false)}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
}

const getStyles = (theme: GrafanaTheme2) => {
  return {
    buttonRow: css`
      margin-top: ${theme.spacing(1.5)};
      > * {
        margin-right: ${theme.spacing(2)};
      }
    `,
  };
};

interface ServiceAccountProfileRowProps {
  label: string;
  value?: string;
  inputType?: string;
  onChange?: (value: string) => void;
}

interface ServiceAccountProfileRowState {
  value: string;
  editing: boolean;
}

export class ServiceAccountProfileRow extends PureComponent<
  ServiceAccountProfileRowProps,
  ServiceAccountProfileRowState
> {
  inputElem?: HTMLInputElement;

  static defaultProps: Partial<ServiceAccountProfileRowProps> = {
    value: '',
    inputType: 'text',
  };

  state = {
    editing: false,
    value: this.props.value || '',
  };

  setInputElem = (elem: any) => {
    this.inputElem = elem;
  };

  onEditClick = () => {
    this.setState({ editing: true }, this.focusInput);
  };

  onCancelClick = () => {
    this.setState({ editing: false, value: this.props.value || '' });
  };

  onInputChange = (event: React.ChangeEvent<HTMLInputElement>, status?: LegacyInputStatus) => {
    if (status === LegacyInputStatus.Invalid) {
      return;
    }

    this.setState({ value: event.target.value });
  };

  onInputBlur = (event: React.FocusEvent<HTMLInputElement>, status?: LegacyInputStatus) => {
    if (status === LegacyInputStatus.Invalid) {
      return;
    }

    this.setState({ value: event.target.value });
  };

  focusInput = () => {
    if (this.inputElem && this.inputElem.focus) {
      this.inputElem.focus();
    }
  };

  onSave = () => {
    if (this.props.onChange) {
      this.props.onChange(this.state.value);
    }
  };

  render() {
    const { label, inputType } = this.props;
    const { value } = this.state;
    const labelClass = cx(
      'width-16',
      css`
        font-weight: 500;
      `
    );

    const inputId = `${label}-input`;
    return (
      <tr>
        <td className={labelClass}>
          <label htmlFor={inputId}>{label}</label>
        </td>
        <td className="width-25" colSpan={2}>
          {this.state.editing ? (
            <Input
              id={inputId}
              type={inputType}
              defaultValue={value}
              onBlur={this.onInputBlur}
              onChange={this.onInputChange}
              ref={this.setInputElem}
              width={30}
            />
          ) : (
            <span>{this.props.value}</span>
          )}
        </td>
        <td>
          {this.props.onChange && (
            <ConfirmButton
              confirmText="Save"
              onClick={this.onEditClick}
              onConfirm={this.onSave}
              onCancel={this.onCancelClick}
            >
              Edit
            </ConfirmButton>
          )}
        </td>
      </tr>
    );
  }
}
