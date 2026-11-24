export const httpMessage = (status: number, path: string, retryAfter: string | null): string => {
  if (status === 429 && path === 'login') {
    const seconds = Number(retryAfter);
    if (Number.isFinite(seconds) && seconds > 0)
      return (
        'Слишком много попыток. Повторите вход через ' + String(Math.ceil(seconds / 60)) + ' мин.'
      );
    return 'Слишком много попыток. Повторите вход позже.';
  }
  if (status === 401 && path !== 'login') {
    if (location.pathname !== '/login') {
      const search = new URLSearchParams({ filters: location.search });
      location.replace('/login?' + search.toString());
    }
    return 'Сессия завершена. Войдите снова.';
  }
  const messages: Record<number, string> = {
    400: 'Проверьте параметры запроса.',
    401: 'Неверный логин или пароль',
    403: 'Недостаточно прав для этого действия.',
    404: path.startsWith('reviews/') ? 'Отзыв не найден' : 'Филиал не найден',
    502: 'Источник временно недоступен. Повторите импорт.',
  };
  return messages[status] ?? 'Не удалось выполнить запрос. Попробуйте ещё раз.';
};
