// ポップアップ表示の共通土台。
export class BasePopup {
  constructor({ id, title, descriptionLines = [], actionLabel, onAction }) {
    this.root = document.createElement('div');
    this.root.className = 'popup-layer is-hidden';
    if (id) {
      this.root.id = id;
    }

    this.card = document.createElement('div');
    this.card.className = 'popup-card';

    this.titleElement = document.createElement('h2');
    this.titleElement.className = 'popup-card__title';

    this.descriptionList = document.createElement('ul');
    this.descriptionList.className = 'popup-card__description';

    this.actionButton = document.createElement('button');
    this.actionButton.className = 'popup-card__action';
    this.actionButton.type = 'button';

    this.card.appendChild(this.titleElement);
    this.card.appendChild(this.descriptionList);
    this.card.appendChild(this.actionButton);
    this.root.appendChild(this.card);
    document.body.appendChild(this.root);

    this.setTitle(title);
    this.setDescriptionLines(descriptionLines);
    this.setActionLabel(actionLabel);
    this.setAction(onAction);
  }

  setTitle(title) {
    this.titleElement.textContent = title;
  }

  setDescriptionLines(lines) {
    this.descriptionList.replaceChildren();
    lines.forEach((line) => {
      const item = document.createElement('li');
      item.textContent = line;
      this.descriptionList.appendChild(item);
    });
  }

  setActionLabel(label) {
    this.actionButton.textContent = label;
  }

  setAction(handler) {
    this.actionHandler = handler;
    this.actionButton.onclick = () => {
      if (this.actionHandler) {
        this.actionHandler();
      }
    };
  }

  setActionStyle({ alert }) {
    this.actionButton.classList.toggle('popup-card__action--alert', Boolean(alert));
  }

  show() {
    this.root.classList.remove('is-hidden');
  }

  hide() {
    this.root.classList.add('is-hidden');
  }
}
