<?php

if (mt_rand(0, 100) < 50) {
	header('HTTP/1.1 503 Service unavailable');
}