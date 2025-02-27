FROM python:3.9-slim

WORKDIR /app

RUN pip install pandas
RUN pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu

CMD ["python","--version"]
