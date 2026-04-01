import * as FileSystem from 'expo-file-system/legacy';
import * as Updates from 'expo-updates';
import { importAllData } from '../storage/storage';
import { t } from '../data/translations';

export function isValidBackup(backup) {
  return (
    backup?.version === 1 &&
    backup.data?.settings !== undefined &&
    Array.isArray(backup.data?.routines) &&
    Array.isArray(backup.data?.equipment) &&
    Array.isArray(backup.data?.history)
  );
}

export async function readAndValidateBackup(uri) {
  let readUri = uri;
  // content:// URIs can't be read directly — copy to cache first
  if (uri.startsWith('content://')) {
    const dest = FileSystem.cacheDirectory + 'incoming_backup.homefit';
    await FileSystem.copyAsync({ from: uri, to: dest });
    readUri = dest;
  }
  const content = await FileSystem.readAsStringAsync(readUri);
  const backup = JSON.parse(content);
  if (!isValidBackup(backup)) throw new Error('invalid');
  return backup;
}

export function promptAndImport(backup, lang, Alert) {
  Alert.alert(
    t('importChoiceTitle', lang),
    t('importChoiceMessage', lang),
    [
      {
        text: t('importChoiceReplace', lang),
        onPress: async () => {
          await importAllData(backup, 'replace');
          Alert.alert('HomeFit', t('importSuccess', lang), [
            { text: 'OK', onPress: () => Updates.reloadAsync().catch(() => {}) },
          ]);
        },
      },
      {
        text: t('importChoiceMerge', lang),
        onPress: async () => {
          await importAllData(backup, 'merge');
          Alert.alert('HomeFit', t('importSuccess', lang), [
            { text: 'OK', onPress: () => Updates.reloadAsync().catch(() => {}) },
          ]);
        },
      },
      { text: t('cancel', lang), style: 'cancel' },
    ]
  );
}
