/**
 * Payment Deep Link Service
 *
 * SPEC-SOC-001: 경조사 관리 기능
 * TAG-007: 결제 딥링크 구현
 *
 * 경조사 축의금/부의금 송금을 위한 딥링크 생성 서비스입니다.
 * 카카오페이, 토스, 네이버페이 등 주요 결제 서비스를 지원합니다.
 */

import { SocialEventType } from '@/shared/models';

/**
 * 결제 수신자 정보
 */
export interface PaymentReceiver {
  /** 수신자 이름 */
  receiverName: string;
  /** 송금 금액 */
  amount: number;
  /** 메시지 */
  message: string;
}

/**
 * 결제 링크 결과
 */
export interface PaymentLinks {
  /** 카카오페이 링크 */
  kakaoPay: string;
  /** 토스 링크 */
  toss: string;
  /** 네이버페이 링크 */
  naverPay: string;
}

/**
 * 관계별 추천 금액 옵션
 */
interface RecommendationOptions {
  /** 경조사 유형 */
  eventType: SocialEventType;
  /** 관계 유형 */
  relationship: string;
}

/**
 * Payment Deep Link Service
 */
export class PaymentDeepLinkService {
  /**
   * 카카오페이 송금 딥링크를 생성합니다.
   *
   * @param receiver - 수신자 정보
   * @returns 카카오페이 딥링크 URL
   */
  createKakaoPayLink(receiver: PaymentReceiver): string {
    const params = new URLSearchParams({
      receiver: receiver.receiverName,
      amount: receiver.amount.toString(),
      message: receiver.message,
    });

    // 카카오페이 스킴 URL (실제 운영 시 정확한 URL 필요)
    return `https://kakaopay.kakao.com/pay?${params.toString()}`;
  }

  /**
   * 토스 송금 딥링크를 생성합니다.
   *
   * @param receiver - 수신자 정보
   * @returns 토스 딥링크 URL
   */
  createTossLink(receiver: PaymentReceiver): string {
    const params = new URLSearchParams({
      amount: receiver.amount.toString(),
      message: receiver.message,
      receiverName: receiver.receiverName,
    });

    // 토스 스킴 URL
    return `https://supertoss.co.kr/transfer?${params.toString()}`;
  }

  /**
   * 네이버페이 송금 딥링크를 생성합니다.
   *
   * @param receiver - 수신자 정보
   * @returns 네이버페이 딥링크 URL
   */
  createNaverPayLink(receiver: PaymentReceiver): string {
    const params = new URLSearchParams({
      amount: receiver.amount.toString(),
      message: receiver.message,
      receiverName: receiver.receiverName,
    });

    // 네이버페이 스킴 URL
    return `https://n-pay.naver.com/transfer?${params.toString()}`;
  }

  /**
   * 관계와 경조사 유형에 따른 추천 금액을 반환합니다.
   *
   * @param options - 추천 옵션
   * @returns 추천 금액
   */
  getRecommendedAmount(options: RecommendationOptions): number {
    const { eventType, relationship } = options;

    // 기본 금액 (단위: 원)
    const baseAmounts: Record<SocialEventType, number> = {
      wedding: 100000,  // 결혼식 기본 10만
      funeral: 50000,  // 장례식 기본 5만
      first_birthday: 50000,  // 돌잔치 기본 5만
      sixtieth_birthday: 100000,  // 환갑 기본 10만
      birthday: 30000,  // 생일 기본 3만
      graduation: 50000,  // 졸업식 기본 5만
      etc: 50000,  // 기타 기본 5만
    };

    // 관계별 계수
    const relationshipMultipliers: Record<string, number> = {
      // 가족: 1.5배
      family: 1.5,
      relative: 1.2,  // 친척

      // 친구: 1.0배 (기준)
      friend: 1.0,
      college_friend: 1.0,
      high_school_friend: 1.0,

      // 직장: 1.2배
      colleague: 1.2,
      boss: 1.5,  // 상사는 더 높게

      // 기타
      neighbor: 0.8,
      etc: 0.5,
    };

    const base = baseAmounts[eventType] || 50000;
    const multiplier = relationshipMultipliers[relationship] || 1.0;

    // 1만 원 단위로 반올림
    const amount = Math.round((base * multiplier) / 10000) * 10000;

    return amount;
  }

  /**
   * 경조사 이벤트에 맞는 결제 링크들을 생성합니다.
   *
   * @param options - 결제 옵션
   * @returns 결제 링크들
   */
  createPaymentLinks(options: {
    eventType: SocialEventType;
    amount: number;
    message: string;
  }): PaymentLinks {
    const receiver: PaymentReceiver = {
      receiverName: '받는 분',
      amount: options.amount,
      message: options.message,
    };

    return {
      kakaoPay: this.createKakaoPayLink(receiver),
      toss: this.createTossLink(receiver),
      naverPay: this.createNaverPayLink(receiver),
    };
  }
}
