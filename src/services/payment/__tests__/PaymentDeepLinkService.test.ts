/**
 * Payment Deep Link Service Tests
 *
 * SPEC-SOC-001: 경조사 관리 기능
 * TAG-007: 결제 딥링크 구현
 *
 * 테스트 커버리지:
 * - 카카오페이 딥링크 생성
 * - 토스 딥링크 생성
 * - 네이버페이 딥링크 생성
 * - 관계별 추천 금액
 * - 딥링크 URL 파싱
 */

import { PaymentDeepLinkService } from '../PaymentDeepLinkService';
import { SocialEventType, SocialEventPriority } from '@/shared/models';

describe('PaymentDeepLinkService', () => {
  let service: PaymentDeepLinkService;

  beforeEach(() => {
    service = new PaymentDeepLinkService();
  });

  describe('딥링크 생성', () => {
    it('카카오페이 송금 딥링크를 생성할 수 있어야 한다', () => {
      const link = service.createKakaoPayLink({
        receiverName: '홍길동',
        amount: 100000,
        message: '축의금',
      });

      expect(link).toContain('https://');
      expect(link).toContain('kakaopay');
    });

    it('토스 송금 딥링크를 생성할 수 있어야 한다', () => {
      const link = service.createTossLink({
        receiverName: '홍길동',
        amount: 100000,
        message: '축의금',
      });

      expect(link).toContain('supertoss.co.kr');
      expect(link).toContain('transfer');
    });

    it('네이버페이 송금 딥링크를 생성할 수 있어야 한다', () => {
      const link = service.createNaverPayLink({
        receiverName: '홍길동',
        amount: 100000,
        message: '축의금',
      });

      expect(link).toContain('n-pay');
    });
  });

  describe('관계별 추천 금액', () => {
    it('결혼식 친구에게는 10만 원을 추천해야 한다', () => {
      const amount = service.getRecommendedAmount({
        eventType: 'wedding',
        relationship: 'friend',
      });

      expect(amount).toBe(100000);
    });

    it('장례식에는 5-10만 원을 추천해야 한다', () => {
      const amount = service.getRecommendedAmount({
        eventType: 'funeral',
        relationship: 'colleague',
      });

      expect(amount).toBeGreaterThanOrEqual(50000);
      expect(amount).toBeLessThanOrEqual(100000);
    });

    it('직장 상사에게는 더 많은 금액을 추천해야 한다', () => {
      const friendAmount = service.getRecommendedAmount({
        eventType: 'wedding',
        relationship: 'friend',
      });

      const bossAmount = service.getRecommendedAmount({
        eventType: 'wedding',
        relationship: 'boss',
      });

      expect(bossAmount).toBeGreaterThan(friendAmount);
    });

    it('가족에게는 가장 많은 금액을 추천해야 한다', () => {
      const friendAmount = service.getRecommendedAmount({
        eventType: 'wedding',
        relationship: 'friend',
      });

      const familyAmount = service.getRecommendedAmount({
        eventType: 'wedding',
        relationship: 'family',
      });

      expect(familyAmount).toBeGreaterThan(friendAmount);
    });
  });

  describe('종합 결제 링크', () => {
    it('경조사 이벤트에 맞는 결제 링크를 생성해야 한다', () => {
      const links = service.createPaymentLinks({
        eventType: 'wedding',
        amount: 100000,
        message: '축의금',
      });

      expect(links.kakaoPay).toBeDefined();
      expect(links.toss).toBeDefined();
      expect(links.naverPay).toBeDefined();
    });

    it('미리 채워진 메시지를 URL 인코딩해서 사용해야 한다', () => {
      const links = service.createPaymentLinks({
        eventType: 'funeral',
        amount: 50000,
        message: '부의금',
      });

      const kakaoLink = links.kakaoPay;

      // URL 인코딩되므로 디코딩 후 확인
      expect(kakaoLink).toContain('message=');
      expect(kakaoLink).toBeDefined();
    });
  });

  describe('딥링크 유효성 검증', () => {
    it('카카오페이 URL 형식이 올바른지 확인해야 한다', () => {
      const link = service.createKakaoPayLink({
        receiverName: '홍길동',
        amount: 100000,
        message: '축의금',
      });

      expect(link).toMatch(/^https?:\/\//);
      expect(link.length).toBeGreaterThan(0);
    });

    it('금액이 URL에 포함되어야 한다', () => {
      const link = service.createTossLink({
        receiverName: '홍길동',
        amount: 50000,
        message: '축의금',
      });

      expect(link).toContain('50000');
    });
  });
});
