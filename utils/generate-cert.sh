#!/bin/bash

if [[ $OSTYPE == 'darwin'* ]]; then 
	SCRIPT=$(readlink "$0")
else
	SCRIPT=$(readlink -f "$0")
fi

THISDIR=$(dirname "$SCRIPT")

ETC_PATH=$THISDIR/../etc
CERT_PATH=$ETC_PATH/cert

#60 days
SIXTYDAYS="5184000"
CERT=$CERT_PATH/default.crt

if [ -f $CERT ]; then
	openssl x509 -enddate -noout -in "$CERT" -checkend "$SIXTYDAYS" | grep -q 'Certificate will expire'
	RESULT=$?
else
	RESULT=0
fi

if [[ $RESULT == '0'* ]]; then

	echo "Certificate 60 Days or less from Expire. Regenerating."

	#make directory if it doesn't exist
	mkdir -p $CERT_PATH 

	#expires in 390 Days (max allowed by safari)
	days=390

	#generate certificate
	openssl req -x509 -nodes \
		-days $days \
		-newkey rsa:8192  \
		-keyout $CERT_PATH/default.key \
		-out $CERT_PATH/default.crt \
		-config $THISDIR/openssl/default.cnf \
		-extensions 'v3_req'

else
	echo "Certificate more than 60 Days from Expire. Not regenerating."
fi
