# Integration Guide

This guide explains how to integrate with Momentum's Social Event Management feature.

## Table of Contents

1. [Overview](#overview)
2. [Calendar Integration](#calendar-integration)
3. [Payment App Integration](#payment-app-integration)
4. [Contact Integration](#contact-integration)
5. [Third-Party Services](#third-party-services)

---

## Overview

Momentum provides integration points for:

- **Calendar Systems**: iOS EventKit, Android Calendar Provider
- **Payment Apps**: KakaoPay, Toss, NaverPay
- **Contact Services**: Device contacts (iOS/Android)
- **External APIs**: Extensible service architecture

---

## Calendar Integration

### Platform Support

| Platform | API | Library | Status |
|----------|-----|---------|--------|
| **iOS** | EventKit | react-native-calendar-events | ✅ Supported |
| **Android** | Calendar Provider | react-native-calendar-events | ✅ Supported |

### Integration Steps

#### 1. Permissions

**iOS (Info.plist)**:
```xml
<key>NSCalendarsUsageDescription</key>
<string>We need access to your calendar to add social events.</string>
<key>NSRemindersUsageDescription</key>
<string>We need access to reminders to notify you about upcoming events.</string>
```

**Android (AndroidManifest.xml)**:
```xml
<uses-permission android:name="android.permission.READ_CALENDAR" />
<uses-permission android:name="android.permission.WRITE_CALENDAR" />
```

#### 2. Request Permissions

```typescript
import { CalendarService } from '@/services/calendar/CalendarService';

const calendarService = new CalendarService();

// Request permissions
const hasPermission = await calendarService.requestPermissions();
if (!hasPermission) {
  // Show permission request UI
  Alert.alert(
    'Calendar Permission Required',
    'Please grant calendar access to enable event synchronization.',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Settings', onPress: () => Linking.openSettings() }
    ]
  );
}
```

#### 3. Add Event to Calendar

```typescript
import { SocialEvent } from '@/shared/models';

const event: SocialEvent = {
  id: 'evt-123',
  type: 'wedding',
  title: '결혼식',
  eventDate: new Date('2025-02-15T14:00:00'),
  location: {
    name: '그랜드 웨딩홀',
    address: '서울시 강남구 테헤란로 123',
  },
  // ... other fields
};

const calendarId = await calendarService.addEvent(event);
console.log('Calendar Event ID:', calendarId);
```

#### 4. Sync Event Changes

```typescript
// When event is updated
event.title = '홍길동 결혼식';
event.eventDate = new Date('2025-02-16T14:00:00');

// Sync with calendar
await calendarService.syncEvent(event);
```

### Event Format

Momentum creates calendar events with the following format:

**Title**: `[EventType] Person Name Event`
**Location**: `Venue Name, Address`
**Notes**:
```
[EventType]
Description (if any)
Gift Amount: XX,XXX원 (if not sent)
Notes (if any)
```

**Alarms**:
- D-7 at 9:00 AM
- D-1 at 9:00 AM
- Day of event at 9:00 AM

---

## Payment App Integration

### Supported Payment Services

| Service | Deep Link Scheme | Status |
|---------|-----------------|--------|
| KakaoPay | `kakaopay://` | ✅ Supported |
| Toss | `supertoss://` | ✅ Supported |
| NaverPay | `naverpay://` | ✅ Supported |

### Integration Steps

#### 1. Create Payment Links

```typescript
import { PaymentDeepLinkService } from '@/services/payment/PaymentDeepLinkService';

const paymentService = new PaymentDeepLinkService();

const links = paymentService.createPaymentLinks({
  eventType: 'wedding',
  amount: 100000,
  message: '축하합니다!',
});

console.log('KakaoPay:', links.kakaoPay);
// kakaopay://pay?amount=100000&message=축하합니다!

console.log('Toss:', links.toss);
// supertoss://transfer?amount=100000&message=축하합니다!

console.log('NaverPay:', links.naverPay);
// naverpay://pay?amount=100000&message=축하합니다!
```

#### 2. Get Recommended Amount

```typescript
const recommended = paymentService.getRecommendedAmount({
  eventType: 'wedding',
  relationship: 'colleague',
});

console.log('Recommended:', recommended); // 100000 (10만원)
```

#### 3. Open Payment App

```typescript
import { Linking } from 'react-native';

// Open KakaoPay
const opened = await Linking.openURL(links.kakaoPay);

if (!opened) {
  Alert.alert('App Not Found', 'KakaoPay app is not installed.');
}
```

### Custom Payment App Integration

To add a new payment app:

```typescript
// Extend PaymentDeepLinkService
class CustomPaymentService extends PaymentDeepLinkService {
  createCustomPaymentLink(receiver: PaymentReceiver): string {
    const params = new URLSearchParams({
      amount: receiver.amount.toString(),
      message: receiver.message,
    });
    return `customapp://pay?${params.toString()}`;
  }
}
```

### Recommended Amounts

Reference for relationship-based amounts:

| Relationship | Wedding | Funeral | First Birthday | 60th Birthday |
|--------------|---------|---------|----------------|---------------|
| Family | 150,000 | 50,000-100,000 | 50,000 | 100,000 |
| Relative | 120,000 | 50,000 | 50,000 | 100,000 |
| Friend | 100,000 | 50,000 | 50,000 | 100,000 |
| College Friend | 100,000 | 50,000 | 50,000 | 100,000 |
| High School Friend | 100,000 | 50,000 | 50,000 | 100,000 |
| Colleague | 120,000 | 50,000 | 50,000 | 100,000 |
| Boss | 150,000 | 100,000 | 50,000 | 100,000 |
| Business Client | 100,000 | 50,000 | 50,000 | 100,000 |
| Neighbor | 80,000 | 40,000 | 30,000 | 80,000 |

---

## Contact Integration

### Platform Support

| Platform | API | Library | Status |
|----------|-----|---------|--------|
| **iOS** | Contacts Framework | react-native-contacts | ⏳ Planned |
| **Android** | Contacts Provider | react-native-contacts | ⏳ Planned |

### Integration Steps (Planned)

```typescript
import Contacts from 'react-native-contacts';

// Request permission
const permission = await Contacts.requestPermission();

if (permission === 'authorized') {
  // Get all contacts
  const contacts = await Contacts.getAll();

  // Find contact by name
  const contact = contacts.find(c =>
    c.displayName.includes(event.contact?.name)
  );

  if (contact) {
    // Auto-fill contact info
    event.contact = {
      name: contact.displayName,
      phone: contact.phoneNumbers[0].number,
      relationship: event.contact?.relationship,
    };
  }
}
```

---

## Third-Party Services

### Extensibility

Momentum's architecture supports adding new integrations:

#### 1. Create Service Class

```typescript
// src/services/custom/CustomService.ts
export class CustomService {
  async processEvent(event: SocialEvent): Promise<void> {
    // Custom integration logic
  }
}
```

#### 2. Register Service

```typescript
// src/services/index.ts
export { CustomService } from './custom/CustomService';
```

#### 3. Use in Application

```typescript
import { CustomService } from '@/services';

const customService = new CustomService();
await customService.processEvent(event);
```

---

## Best Practices

### 1. Permission Handling

Always check and request permissions before accessing platform features:

```typescript
const hasPermission = await checkPermission();
if (!hasPermission) {
  const granted = await requestPermission();
  if (!granted) {
    // Handle denial gracefully
    return;
  }
}
```

### 2. Error Handling

Implement proper error handling for external services:

```typescript
try {
  const result = await externalService.call();
} catch (error) {
  if (error instanceof NetworkError) {
    // Retry or show offline message
  } else if (error instanceof PermissionError) {
    // Request permission again
  } else {
    // Log and show generic error
  }
}
```

### 3. Deep Link Fallbacks

Always provide fallbacks for deep links:

```typescript
const opened = await Linking.openURL(deepLink);

if (!opened) {
  // Fall back to web version
  await Linking.openURL(webUrl);
}
```

### 4. Async Operation Cleanup

Clean up async operations when components unmount:

```typescript
useEffect(() => {
  let mounted = true;

  async function loadData() {
    const data = await service.fetch();
    if (mounted) {
      setState(data);
    }
  }

  loadData();

  return () => {
    mounted = false;
  };
}, []);
```

---

## Troubleshooting

### Calendar Events Not Appearing

**Symptoms**: Calendar integration succeeds but events don't appear in calendar app.

**Solutions**:
1. Verify calendar permissions are granted
2. Check if correct calendar is selected (iOS may have multiple calendars)
3. Try fetching events with `findEvents()` to verify creation
4. Restart the calendar app

### Payment Links Not Opening

**Symptoms**: Tapping payment link does nothing.

**Solutions**:
1. Verify payment app is installed
2. Check deep link scheme is correct
3. Test with `Linking.canOpenURL()` first
4. Provide fallback to app store

### Permission Denials

**Symptoms**: Permissions denied and can't request again.

**Solutions**:
1. For iOS: User must manually enable in Settings
2. For Android: Check if `shouldShowRequestPermissionRationale()` is true
3. Provide clear explanation of why permission is needed
4. Link to app settings for manual enable

---

**Last Updated**: 2026-01-18
**Version**: 1.0.0
