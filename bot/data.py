from typing import NamedTuple
from enum import Enum
from datetime import date
import json


class Gender(Enum):
    MALE = 0
    FEMALE = 1

    def __str__(self):
        if self == Gender.MALE:
            return 'männlich'
        elif self == Gender.FEMALE:
            return 'weiblich'


class Request(NamedTuple):
    text: str
    previous_text: str
    mood: float
    affection: float
    bot_gender: Gender
    bot_name: str
    bot_birthdate: date
    bot_favorite_color: str

    @property
    def bot_birthday(self):
        return self.bot_birthdate.strftime('%d.%m.%Y')

    @property
    def bot_age(self):
        today = date.today()
        bdate = self.bot_birthdate
        return today.year - bdate.year - (1 if (today.month, today.day) < (bdate.month, bdate.day) else 0)


class Response(NamedTuple):
    text: str
    mood: float
    affection: float


def parse_request(json_data: str):
    data = json.loads(json_data)

    return Request(
        data["text"],
        data["previous_text"],
        data["mood"],
        data["affection"],
        Gender(data["bot_gender"]),
        data["bot_name"],
        date.fromtimestamp(data["bot_birthdate"]),
        data["bot_favorite_color"]
    )
