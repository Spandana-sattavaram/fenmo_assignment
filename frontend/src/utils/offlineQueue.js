const KEY = "expense_queue";

export function getQueue() {
  return JSON.parse(localStorage.getItem(KEY)) || [];
}

export function saveQueue(queue) {
  localStorage.setItem(KEY, JSON.stringify(queue));
}

export function addToQueue(item) {
  const queue = getQueue();

  const exists = queue.find(
    (q) =>
      q.data.amount === item.data.amount &&
      q.data.category.toLowerCase() === item.data.category.toLowerCase() &&
      q.data.date === item.data.date
  );

  if (exists) return;

  queue.push(item);
  saveQueue(queue);
}