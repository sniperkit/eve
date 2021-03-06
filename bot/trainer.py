import pickle
from os import path, mkdir
from typing import Tuple, List, Dict

import numpy as np
from keras.models import Sequential, model_from_json

from bot.model_definitions import Mode
from bot.setup import setup_bot
from bot.training_data import TrainingData


def setup_models_dir() -> str:
    """
    Creates the models directory if it does not exist

    Returns:
        The path to the models directory.
    """
    dir = path.join(path.dirname(__file__), 'models')
    if not path.exists(dir):
        mkdir(dir)
    if not path.isdir(dir):
        raise Exception('Models path is not a directory: {}'.format(dir))
    return dir


dir = setup_models_dir()


def train_model(mode: Mode):
    """
    Trains a neural network with the defined patterns and categories.
    Patterns will be split into words, stemmed by a German snowball stemmer and
    indexed by saving all stems in a list of total stems and assigning indices.
    The trained model will be saved in the models directory and can be loaded
    by the pattern recognizer using the load_model function.

    Args:
        mode: The mode to the train the model for.
    """
    # Creates a directory where the trained models are stored

    model, train_x, train_y, words = setup_bot(mode)

    # Compile neural network
    model.compile(loss='categorical_crossentropy',
                  optimizer='adam', metrics=['accuracy'])
    # Train neural network
    # validation_split is set to 0 because our dataset for pattern recognition
    # is too small to compensate for disregarding data during training
    model.fit(train_x, train_y, batch_size=32, epochs=200,
              verbose=1, validation_split=0, shuffle=True)

    save_training(mode, model, train_x, train_y, words)


def save_training(
    mode: Mode,
    model: Sequential,
    train_x: np.ndarray,
    train_y: np.ndarray,
    words: List[str]
):
    """
    Saves the trained model and other relevant trained data.

    Args:
        mode: The mode to save the model for
        model: The sequential model to save
        train_x: The feature parameters
        train_y: The label parameters
        words: Bag of words used for indexing the words in train_x
    """
    file_name: str = mode.value

    # Save model
    with open(path.join(dir, '%s-model.json' % file_name), 'w') as f:
        f.write(model.to_json())
    model.save_weights(path.join(dir, '%s-weights.h5' % file_name))
    # Save total_stems and training data
    with open(path.join(dir, '%s.dump' % file_name), 'wb') as f:
        pickle.dump(TrainingData(words, train_x, train_y), f)


# Cache for avoiding unnecessary multiple loading of models
model_cache: Dict[Mode, Tuple[Sequential, TrainingData]] = {}


def load_model(mode: Mode) -> Tuple[Sequential, TrainingData]:
    """
    Loads a pre-trained model from disk, as well as the training data dump.
    If the model has been loaded before during runtime, the cached model
    will be returned instead.

    Args:
        mode: The mode to load the model for.

    Returns:
        A pre-trained model loaded from disk as well as an instance of
        TrainingData, containg the data used for training and the list of total
        stems used.
    """

    if mode in model_cache:
        return model_cache[mode]

    file_name: str = mode.value
    with open(path.join(dir, '%s.dump' % file_name), 'rb') as f:
        data = pickle.load(f)

    with open(path.join(dir, '%s-model.json' % file_name)) as f:
        model = model_from_json(f.read())

    model.load_weights(path.join(dir, '%s-weights.h5' % file_name))

    model_cache[mode] = (model, data)

    return model, data
