
export const CATEGORY_REACT_NATIVE = 'React Native'
export const CATEGORY_EXPONENT = 'Exponent'

export const CATEGORIES = [
  CATEGORY_REACT_NATIVE,
  CATEGORY_EXPONENT,
]

export const TEMPLATES_FOR_CATEGORY = {
  [CATEGORY_REACT_NATIVE]: [
    {
      "id": "blank",
      "name": "Blank",
      "description": "The Blank project template includes the minimum dependencies to run and an empty root component.",
      "version": "0.36.0",
      "iconUrl": "https://s3.amazonaws.com/exp-starter-apps/template_icon_blank.png",
    },
  ],
  [CATEGORY_EXPONENT]: [
    {
      "id": "blank",
      "name": "Blank",
      "description": "The Blank project template includes the minimum dependencies to run and an empty root component.",
      "version": "1.7.4",
      "iconUrl": "https://s3.amazonaws.com/exp-starter-apps/template_icon_blank.png",
    },
    {
      "id": "tabs",
      "name": "Tab Navigation",
      "description": "The Tab Navigation project template includes several example screens.",
      "version": "1.7.4",
      "iconUrl": "https://s3.amazonaws.com/exp-starter-apps/template_icon_tabs.png",
    },
  ],
}
