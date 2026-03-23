import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform, Alert, Linking } from 'react-native';
// Removed unneeded medication import as we will use a loose type since it comes from the API shape.

// Como o aplicativo deve se comportar quando recebe uma notificação estando em FOREGROUND
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const requestNotificationPermissions = async (showModal?: any) => {
  if (Platform.OS === 'web') return true;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1DB954',
      sound: 'default',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Permissão para notificações não foi concedida!');
      if (showModal) {
        showModal(
          'Notificações Desativadas',
          'Para receber lembretes dos seus medicamentos, você precisa permitir as notificações nas configurações do seu celular.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Abrir Configurações', onPress: () => Linking.openSettings() }
          ]
        );
      } else {
        Alert.alert(
          'Notificações Desativadas',
          'Para receber lembretes dos seus medicamentos, você precisa permitir as notificações nas configurações do seu celular.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Abrir Configurações', onPress: () => Linking.openSettings() }
          ]
        );
      }
      return false;
    }
    return true;
  } else {
    console.log('Notificações push/locais precisam de um dispositivo físico para certas coisas, mas as Locais podem funcionar em emuladores dependendo do OS.');
    return true; // No emulador frequentemente retornamos true para testes locais
  }
};

/**
 * Dada uma string de horário "HH:MM", converte para as partes Hour e Minute
 */
const parseTime = (timeString: string) => {
  const [hourStr, minuteStr] = timeString.split(':');
  return {
    hour: parseInt(hourStr, 10),
    minute: parseInt(minuteStr, 10),
  };
};

/**
 * Calcula um novo horário retroativo (ex: menos 30 minutos)
 */
const getOffsetTime = (hour: number, minute: number, offsetMinutes: number) => {
  let newMinute = minute - offsetMinutes;
  let newHour = hour;

  if (newMinute < 0) {
    newMinute += 60;
    newHour -= 1;
    if (newHour < 0) {
      newHour += 24;
    }
  }

  return { hour: newHour, minute: newMinute };
};

export const scheduleMedicationAlerts = async (medication: any) => {
  if (Platform.OS === 'web') return;
  if (!medication.times) return;

  // Tentar capturar array se estiver em string JSON
  let timesArray: string[] = [];
  try {
    timesArray = typeof medication.times === 'string' ? JSON.parse(medication.times) : medication.times;
  } catch (e) {
    console.error('Falha ao parsear horários da medicação', e);
    return;
  }

  if (!Array.isArray(timesArray)) return;

  for (const timeString of timesArray) {
    const { hour, minute } = parseTime(timeString);

    // 1. Notificação de 30 minutos antes
    const time30 = getOffsetTime(hour, minute, 30);
    await Notifications.scheduleNotificationAsync({
      identifier: `med-${medication.id}-${timeString}-30m`,
      content: {
        title: 'Lembrete de Medicamento ⏳',
        body: `Seu medicamento ${medication.name} deve ser tomado em 30 minutos!`,
        data: { medicationId: medication.id, exactTime: timeString, type: 'reminder-30m' },
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: time30.hour,
        minute: time30.minute,
      },
    });

    // 2. Notificação exata
    await Notifications.scheduleNotificationAsync({
      identifier: `med-${medication.id}-${timeString}-exact`,
      content: {
        title: 'Hora do Medicamento! 💊',
        body: `Hora de tomar ${medication.name}! Não esqueça de registrar no app.`,
        data: { medicationId: medication.id, exactTime: timeString, type: 'reminder-exact' },
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hour,
        minute: minute,
      },
    });
  }
};

export const cancelMedicationAlerts = async (medicationId: string, timeString?: string) => {
  if (Platform.OS === 'web') return;
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();

  const notificationsToCancel = scheduled.filter(notif => {
    if (!notif.identifier.includes(`med-${medicationId}-`)) return false;
    if (timeString && !notif.identifier.includes(`-${timeString}-`)) return false;
    return true;
  });

  await Promise.all(
    notificationsToCancel.map(notif =>
      Notifications.cancelScheduledNotificationAsync(notif.identifier)
    )
  );
};

export const scheduleFollowupMeasurement = async (type: 'glucose' | 'pressure', hoursOffset: number = 2) => {
  if (Platform.OS === 'web') return;
  const triggerTime = new Date();
  triggerTime.setHours(triggerTime.getHours() + hoursOffset);

  const title = type === 'glucose' ? 'Aferição de Glicose 🩸' : 'Aferição de Pressão ❤️';
  const body = type === 'glucose'
    ? 'Já se passaram algumas horas desde sua medicação. Não esqueça de medir sua glicose!'
    : 'Lembrete: momento ideal para aferir sua pressão arterial de controle.';

  await Notifications.scheduleNotificationAsync({
    identifier: `followup-${type}-${Date.now()}`,
    content: {
      title,
      body,
      data: { type: `followup-${type}` },
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerTime,
    },
  });
};

export const scheduleRefillAlert = async (medicationName: string, daysLeft: number = 3) => {
  if (Platform.OS === 'web') return;
  // Limpar alertas antigos de refill deste medicamento para não sobrepor
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notif of scheduled) {
    if (notif.identifier.startsWith(`refill-${medicationName}`)) {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
  }

  // 1. Notificação Imediata (gatilho para 2 segundos após entrar no app)
  await Notifications.scheduleNotificationAsync({
    identifier: `refill-${medicationName}-immediate`,
    content: {
      title: 'Atenção à Receita! 📝',
      body: `Atenção: Sua receita de ${medicationName} está quase no fim!`,
      data: { type: 'refill' },
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 2,
      repeats: false,
    },
  });

  // 2. Lembrete Diário Fixo às 12:00
  await Notifications.scheduleNotificationAsync({
    identifier: `refill-${medicationName}-12h`,
    content: {
      title: 'Renovação de Receita Pendente 📝',
      body: `Lembrete (12h): Não esqueça de ir ao posto renovar sua receita de ${medicationName}.`,
      data: { type: 'refill-daily-12h' },
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 12,
      minute: 0,
    },
  });

  // 3. Lembrete Diário Fixo às 18:00
  await Notifications.scheduleNotificationAsync({
    identifier: `refill-${medicationName}-18h`,
    content: {
      title: 'Renovação de Receita Pendente 📝',
      body: `Lembrete (18h): Sua receita de ${medicationName} está no fim. Verifique se o posto Saúde da Família está aberto amanhã.`,
      data: { type: 'refill-daily-18h' },
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 18,
      minute: 0,
    },
  });
};
