import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import App from '../App';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe('entry points', () => {
  afterEach(() => {
    window.localStorage.clear();
    cleanup();
  });

  it('app root shows the splash screen before onboarding', () => {
    renderAt('/');
    expect(screen.getByRole('img', { name: /고찌봄/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '고찌봄 시작하기' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '보호자·복지사로 시작하기' })).not.toBeInTheDocument();
  });

  it('moves from splash to onboarding only after pressing start', () => {
    renderAt('/');
    fireEvent.click(screen.getByRole('button', { name: '고찌봄 시작하기' }));
    expect(screen.getByRole('button', { name: '보호자·복지사로 시작하기' })).toBeInTheDocument();
  });

  it('caregiver signup renders the first step (owner info)', () => {
    renderAt('/caregiver/signup');
    expect(screen.getByRole('heading', { name: '보호자 정보를 입력해요' })).toBeInTheDocument();
    expect(screen.getByLabelText('휴대폰 번호')).toBeInTheDocument();
  });

  it('senior register has no QR/camera and asks for phone plus a pairing code', () => {
    renderAt('/senior/register');
    expect(screen.getByRole('heading', { name: '어르신 기기 연결' })).toBeInTheDocument();
    expect(screen.getByLabelText('어르신 휴대폰 번호')).toBeInTheDocument();
    expect(screen.getByLabelText('연결 코드')).toBeInTheDocument();
    expect(screen.queryByText(/QR/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/데모/)).not.toBeInTheDocument();
  });

  it('connects the senior device with the initial mock values', async () => {
    renderAt('/senior/register');
    fireEvent.click(screen.getByRole('button', { name: '연결하기' }));

    expect(await screen.findByRole('heading', { name: '연결됐어요!' })).toBeInTheDocument();
  });

  it('connects the senior device with a generated caregiver code', async () => {
    renderAt('/caregiver/manage');
    expect(await screen.findByRole('heading', { name: '구성원 편집' })).toBeInTheDocument();
    fireEvent.click(await screen.findByRole('button', { name: '6자리 코드 만들기' }));

    const codeNode = await screen.findByLabelText(/^연결 코드 \d{6}$/);
    const code = codeNode.textContent ?? '';
    expect(code).toMatch(/^\d{6}$/);

    cleanup();
    renderAt('/senior/register');
    fireEvent.change(screen.getByLabelText('연결 코드'), { target: { value: code } });
    fireEvent.click(screen.getByRole('button', { name: '연결하기' }));

    expect(await screen.findByRole('heading', { name: '연결됐어요!' })).toBeInTheDocument();
  });

  it('adds a caregiver member and connects signup by the invited phone number', async () => {
    renderAt('/caregiver/manage');

    fireEvent.click(await screen.findByRole('button', { name: '구성원 추가' }));
    expect(screen.getByDisplayValue('김초대')).toBeInTheDocument();
    expect(screen.getByDisplayValue('010-2222-3333')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '추가하기' }));

    expect(await screen.findByText('김초대')).toBeInTheDocument();
    expect(screen.getByText(/같은 번호로 가입하면/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /처방 QR 등록하기/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '6자리 코드 만들기' }));
    const roomCodeNode = await screen.findByLabelText(/^연결 코드 \d{6}$/);
    const roomCode = roomCodeNode.textContent ?? '';
    expect(roomCode).toMatch(/^\d{6}$/);

    cleanup();
    renderAt('/caregiver/signup');

    fireEvent.change(screen.getByLabelText('휴대폰 번호'), { target: { value: '010-2222-3333' } });
    fireEvent.click(screen.getByRole('button', { name: '인증번호 받기' }));
    fireEvent.click(await screen.findByRole('button', { name: '확인' }));
    expect(await screen.findByRole('heading', { name: '보호자 방을 인증해요' })).toBeInTheDocument();
    expect(screen.getByLabelText('보호자 방 코드')).toHaveValue('123456');
    fireEvent.change(screen.getByLabelText('보호자 방 코드'), { target: { value: roomCode } });
    fireEvent.click(screen.getByRole('button', { name: '방 연결하기' }));

    expect(await screen.findByRole('heading', { name: '김순자님 복약 상태' })).toBeInTheDocument();
  });

  it('removes a caregiver member after confirming the delete card', async () => {
    renderAt('/caregiver/manage');

    expect(await screen.findByText('김지은')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '김지은 삭제' }));

    expect(screen.getByText('김지은님을 구성원에서 삭제할까요?')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '삭제하기' }));

    expect(screen.queryByText('김지은')).not.toBeInTheDocument();
    expect(screen.getByText('김지은님을 구성원에서 삭제했어요.')).toBeInTheDocument();
  });
});
